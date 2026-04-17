const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authorize } = require('../middleware/auth');
const { parseExcelFile } = require('../utils/excelParser');
const prisma = require('../prisma');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream' // Allow generic binary for Excel files with unclear MIME
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const isExcelExt = ['.xlsx', '.xls'].includes(ext);
    
    console.log(`\n=== FILE UPLOAD FILTER ===`);
    console.log(`File: ${file.originalname}`);
    console.log(`MIME: ${file.mimetype}`);
    console.log(`Extension: ${ext}`);
    console.log(`Is Excel Extension: ${isExcelExt}`);
    console.log(`========================\n`);
    
    if (allowedTypes.includes(file.mimetype) || isExcelExt) {
      cb(null, true);
    } else {
      const errorMsg = `Invalid file type. File: ${file.originalname}, MIME: ${file.mimetype}. Only Excel files (.xlsx, .xls) are allowed.`;
      console.error(errorMsg);
      cb(new Error(errorMsg));
    }
  }
});

// Preview Excel metadata (tender info + group count) without saving
router.post(
  '/preview-excel',
  authorize('ADMIN', 'STAFF'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const parsedData = await parseExcelFile(req.file.path, null);
      // Clean up temp file
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});
      res.json({
        tenderMeta: parsedData.tenderMeta,
        groupCount: parsedData.groups.length,
        itemCount: parsedData.groups.reduce((s, g) => s + g.items.length, 0),
        groups: parsedData.groups.map(g => ({ code: g.code, name: g.name, itemCount: g.items.length }))
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all tenders with pagination and selective loading
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const includeDetails = req.query.details === 'true';

    // Build where clause based on user role
    const whereClause = req.user?.role === 'STAFF' 
      ? { createdBy: req.userId } 
      : {}; // Admin sees all

    const [tenders, total] = await Promise.all([
      prisma.tender.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: includeDetails ? {
          groups: {
            include: {
              items: true,
              bids: {
                include: { bidder: true }
              }
            }
          },
          files: true,
          creator: {
            select: { id: true, name: true, email: true, role: true }
          },
          _count: {
            select: { groups: true }
          }
        } : {
          creator: {
            select: { id: true, name: true, email: true, role: true }
          },
          _count: {
            select: { groups: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tender.count({ where: whereClause })
    ]);

    res.json({
      data: tenders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single tender
router.get('/:id', async (req, res, next) => {
  try {
    const tenderId = parseInt(req.params.id);
    
    // Build where clause with ownership check
    const whereClause = { id: tenderId };
    if (req.user?.role === 'STAFF') {
      whereClause.createdBy = req.userId;
    }

    const tender = await prisma.tender.findFirst({
      where: whereClause,
      include: {
        groups: {
          include: {
            items: true,
            bids: {
              include: { bidder: true },
              orderBy: { bidPrice: 'desc' }
            },
            parentGroup: true,
            childGroups: true,
            bidders: {
              include: { bidder: true }
            }
          }
        },
        files: true,
        creator: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    res.json(tender);
  } catch (error) {
    next(error);
  }
});

// Upload tender with Excel file
router.post(
  '/',
  authorize('ADMIN', 'STAFF'),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('\n=== MULTER ERROR ===');
        console.error('Error:', err.message);
        console.error('Code:', err.code);
        console.error('====================\n');
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  [
    body('tenderNumber').optional(),
    body('exchangeRate').optional(),
    body('location').optional(),
    body('date').optional(),
    body('title').optional(),
    body('responsibleBody').optional()
  ],
  async (req, res, next) => {
    console.log('\n=== TENDER UPLOAD ROUTE HIT ===');
    console.log('File received:', req.file ? req.file.originalname : 'NO FILE');
    console.log('Body:', req.body);
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenderNumber, exchangeRate, location, date, title, responsibleBody, tenderType, originalTenderId, harajRound } = req.body;

      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'Excel file is required' });
      }
      
      console.log('Starting transaction...');

      const result = await prisma.$transaction(async (tx) => {
        // Parse Excel first to get metadata
        const tempFilePath = req.file.path;
        console.log('Calling parseExcelFile with path:', tempFilePath);
        const parsedData = await parseExcelFile(tempFilePath, null);
        console.log('Excel parsed successfully. Groups:', parsedData.groups.length);
        const meta = parsedData.tenderMeta || {};

        // Use Excel metadata as primary source, fallback to form data
        const finalTenderNumber = meta.tenderNumber || tenderNumber || 'TND-' + Date.now();
        const finalExchangeRate = meta.exchangeRate ? parseFloat(meta.exchangeRate) : (exchangeRate ? parseFloat(exchangeRate) : 1);
        const finalTitle = meta.title || title || null;
        const finalLocation = meta.location || location || null;
        const finalResponsibleBody = meta.responsibleBody || responsibleBody || null;
        
        console.log('Creating tender with:', { finalTenderNumber, finalExchangeRate, finalTitle, finalLocation, finalResponsibleBody });
        
        // Parse date properly - handle DD-MM-YYYY format from Excel
        let finalDate = null;
        if (meta.date) {
          const dateStr = String(meta.date).trim();
          if (dateStr.includes('-')) {
            const [day, month, year] = dateStr.split('-');
            finalDate = new Date(year, month - 1, day);
          } else {
            finalDate = new Date(dateStr);
          }
        } else if (date) {
          finalDate = new Date(date);
        }
        console.log('Final date:', finalDate);

        const tender = await tx.tender.create({
          data: {
            tenderNumber: finalTenderNumber,
            exchangeRate: finalExchangeRate,
            location: finalLocation,
            date: finalDate,
            title: finalTitle,
            responsibleBody: finalResponsibleBody,
            tenderType: tenderType || 'AUCTION',
            originalTenderId: originalTenderId ? parseInt(originalTenderId) : null,
            harajRound: harajRound ? parseInt(harajRound) : 1,
            status: 'OPEN',
            createdBy: req.userId
          }
        });
        console.log('Tender created with ID:', tender.id);

        await tx.file.create({
          data: {
            tenderId: tender.id,
            filename: req.file.originalname,
            path: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
          }
        });
        console.log('File record created');

        const effectiveExchangeRate = finalExchangeRate;

        for (const groupData of parsedData.groups) {
          console.log(`Processing group: ${groupData.code} with ${groupData.items.length} items`);
          
          // Determine initial round from first item
          let initialRound = 'CIF'; // default
          if (tenderType === 'HARAJ') {
            initialRound = 'HARAJ';
          } else if (groupData.items.length > 0) {
            const firstItem = groupData.items[0];
            const prices = [
              { name: 'CIF', value: firstItem.cif || 0 },
              { name: 'FOB', value: firstItem.fob || 0 },
              { name: 'TAX', value: firstItem.tax || 0 }
            ];
            prices.sort((a, b) => b.value - a.value);
            initialRound = prices[0].name;
          }
          console.log(`Initial round for group ${groupData.code}: ${initialRound}`);

          // Parse group-level date if present
          let groupDateString = null;
          const groupMeta = groupData.metadata || {};
          if (groupMeta.date) {
            const dateStr = String(groupMeta.date).trim();
            // Store as string in DD-MM-YYYY format
            if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                // If already in DD-MM-YYYY format, keep it
                if (parts[0].length <= 2) {
                  groupDateString = dateStr;
                } else {
                  // If in YYYY-MM-DD format, convert to DD-MM-YYYY
                  groupDateString = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
              }
            } else {
              groupDateString = dateStr;
            }
          }

          const group = await tx.group.create({
            data: {
              tenderId: tender.id,
              code: groupData.code,
              name: groupData.name,
              currentRound: initialRound,
              roundNumber: 1,
              status: 'OPEN',
              title: groupMeta.title || null,
              date: groupDateString,
              location: groupMeta.location || null,
              responsibleBody: groupMeta.responsibleBody || null,
              exchangeRate: groupMeta.exchangeRate ? parseFloat(groupMeta.exchangeRate) : null
            }
          });
          console.log(`Group created with ID: ${group.id}`);

          // Use group-specific exchange rate if available, otherwise use tender-level
          const groupExchangeRate = groupMeta.exchangeRate ? parseFloat(groupMeta.exchangeRate) : effectiveExchangeRate;

          // Batch create items
          let groupBasePrice = 0;
          const itemsToCreate = [];
          
          for (const itemData of groupData.items) {
            // Use item-specific exchange rate if available, fallback to group, then tender
            const itemExchangeRate = itemData.exchangeRate ? parseFloat(itemData.exchangeRate) : groupExchangeRate;
            
            let unitPrice;
            if (tenderType === 'HARAJ') {
              // For Haraj: use LOWEST of CIF, FOB, TAX
              const lowestPrice = Math.min(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0);
              unitPrice = lowestPrice * itemExchangeRate;
            } else {
              // For Auction: use the price for the current round (initialRound)
              const prices = { CIF: itemData.cif || 0, FOB: itemData.fob || 0, TAX: itemData.tax || 0 };
              unitPrice = prices[initialRound] * itemExchangeRate;
            }
            const totalPrice = unitPrice * (itemData.totalQuantity || 0);
            groupBasePrice += totalPrice;

            itemsToCreate.push({
              groupId: group.id,
              itemCode: itemData.itemCode || '-',
              serialNumber: itemData.serialNumber || null,
              name: itemData.name,
              itemType: itemData.itemType || null,
              brand: itemData.brand || null,
              country: itemData.country || null,
              unit: itemData.unit || 'EA',
              warehouse1: itemData.warehouse1 || 0,
              warehouse2: itemData.warehouse2 || 0,
              warehouse3: itemData.warehouse3 || 0,
              totalQuantity: itemData.totalQuantity || 0,
              fob: itemData.fob || 0,
              cif: itemData.cif || 0,
              tax: itemData.tax || 0,
              exchangeRate: itemExchangeRate,
              expireDate: itemData.expireDate || null,
              unitPrice,
              totalPrice
            });
          }

          // Batch insert all items for this group
          await tx.item.createMany({ data: itemsToCreate });
          console.log(`Created ${groupData.items.length} items for group ${groupData.code}. Base price: ${groupBasePrice}`);

          await tx.group.update({
            where: { id: group.id },
            data: { 
              basePrice: groupBasePrice,
              harajPrice: tenderType === 'HARAJ' ? groupBasePrice : null
            }
          });
        }
        console.log('All groups processed successfully');

        await tx.auditLog.create({
          data: {
            userId: req.userId,
            action: 'UPLOAD',
            entity: 'Tender',
            entityId: tender.id,
            details: JSON.stringify({ tenderNumber: finalTenderNumber, file: req.file.originalname, groupsCount: parsedData.groups.length }),
            ipAddress: req.ip
          }
        });
        console.log('Audit log created');

      return await tx.tender.findUnique({
        where: { id: tender.id },
        include: { groups: { include: { items: true } }, files: true }
      });
    }, { timeout: 60000 });

      res.status(201).json(result);
    } catch (error) {
      console.error('\n=== TENDER UPLOAD ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('===========================\n');
      next(error);
    }
  }
);

// Upload groups from Excel into an existing tender
router.post(
  '/:id/upload-group-excel',
  authorize('ADMIN', 'STAFF'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      const tenderId = parseInt(req.params.id);
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
      if (!tender) return res.status(404).json({ error: 'Tender not found' });

      const parsedData = await parseExcelFile(req.file.path, tenderId);
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});

      const createdGroups = [];

      for (const groupData of parsedData.groups) {
        let initialRound = 'CIF';
        if (tender.tenderType === 'HARAJ') {
          initialRound = 'HARAJ';
        } else if (groupData.items.length > 0) {
          const fi = groupData.items[0];
          const prices = [
            { name: 'CIF', value: fi.cif || 0 },
            { name: 'FOB', value: fi.fob || 0 },
            { name: 'TAX', value: fi.tax || 0 }
          ];
          prices.sort((a, b) => b.value - a.value);
          initialRound = prices[0].name;
        }

        const groupMeta = groupData.metadata || {};
        const group = await prisma.group.create({
          data: {
            tenderId,
            code: groupData.code,
            name: groupData.name,
            currentRound: initialRound,
            roundNumber: 1,
            status: 'OPEN',
            title: groupMeta.title || null,
            date: groupMeta.date || null,
            location: groupMeta.location || null,
            responsibleBody: groupMeta.responsibleBody || null,
            exchangeRate: groupMeta.exchangeRate ? parseFloat(groupMeta.exchangeRate) : null
          }
        });

        const groupExchangeRate = groupMeta.exchangeRate
          ? parseFloat(groupMeta.exchangeRate)
          : tender.exchangeRate;

        let basePrice = 0;
        for (const itemData of groupData.items) {
          const itemExchangeRate = itemData.exchangeRate
            ? parseFloat(itemData.exchangeRate)
            : groupExchangeRate;
          const prices = { CIF: itemData.cif || 0, FOB: itemData.fob || 0, TAX: itemData.tax || 0 };
          const unitPrice = (tender.tenderType === 'HARAJ'
            ? Math.min(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0)
            : prices[initialRound]) * itemExchangeRate;
          const totalPrice = unitPrice * (itemData.totalQuantity || 0);
          basePrice += totalPrice;

          await prisma.item.create({
            data: {
              groupId: group.id,
              itemCode: itemData.itemCode || '-',
              serialNumber: itemData.serialNumber || null,
              name: itemData.name,
              itemType: itemData.itemType || null,
              brand: itemData.brand || null,
              country: itemData.country || null,
              unit: itemData.unit || 'EA',
              warehouse1: itemData.warehouse1 || 0,
              warehouse2: itemData.warehouse2 || 0,
              warehouse3: itemData.warehouse3 || 0,
              totalQuantity: itemData.totalQuantity || 0,
              fob: itemData.fob || 0,
              cif: itemData.cif || 0,
              tax: itemData.tax || 0,
              exchangeRate: itemExchangeRate,
              expireDate: itemData.expireDate || null,
              unitPrice,
              totalPrice
            }
          });
        }

        await prisma.group.update({
          where: { id: group.id },
          data: { basePrice, harajPrice: tender.tenderType === 'HARAJ' ? basePrice : null }
        });

        createdGroups.push({ ...group, basePrice, itemCount: groupData.items.length });
      }

      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'UPLOAD_GROUPS',
          entity: 'Tender',
          entityId: tenderId,
          details: JSON.stringify({ groupsAdded: createdGroups.length }),
          ipAddress: req.ip
        }
      });

      res.status(201).json({ message: `${createdGroups.length} group(s) added`, groups: createdGroups });
    } catch (error) { next(error); }
  }
);

// Update tender
router.patch(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const tenderId = parseInt(req.params.id);
      const { title, tenderNumber, exchangeRate, location, date, status, responsibleBody } = req.body;

      // Check ownership for staff
      if (req.user.role === 'STAFF') {
        const existing = await prisma.tender.findFirst({
          where: { id: tenderId, createdBy: req.userId }
        });
        if (!existing) {
          return res.status(403).json({ error: 'Not authorized to update this tender' });
        }
      }

      const tender = await prisma.tender.update({
        where: { id: tenderId },
        data: {
          ...(title && { title }),
          ...(tenderNumber && { tenderNumber }),
          ...(exchangeRate && { exchangeRate: parseFloat(exchangeRate) }),
          ...(location && { location }),
          ...(date && { date: new Date(date) }),
          ...(status && { status }),
          ...(responsibleBody && { responsibleBody })
        }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'UPDATE',
          entity: 'Tender',
          entityId: tender.id,
          details: JSON.stringify(req.body),
          ipAddress: req.ip
        }
      });

      res.json(tender);
    } catch (error) {
      next(error);
    }
  }
);

// Delete tender
router.delete(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const tenderId = parseInt(req.params.id);

      // Check ownership for staff
      const whereClause = { id: tenderId };
      if (req.user.role === 'STAFF') {
        whereClause.createdBy = req.userId;
      }

      const tender = await prisma.tender.findFirst({ where: whereClause });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found or not authorized' });
      }

      // Delete tender (cascade will handle related records)
      await prisma.tender.delete({
        where: { id: tenderId }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'DELETE',
          entity: 'Tender',
          entityId: tenderId,
          details: JSON.stringify({ tenderNumber: tender.tenderNumber }),
          ipAddress: req.ip
        }
      });

      res.json({ message: 'Tender deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;