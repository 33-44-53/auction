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
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
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

// Get all tenders
router.get('/', async (req, res, next) => {
  try {
    const tenders = await prisma.tender.findMany({
      include: {
        groups: {
          include: {
            items: true,
            bids: {
              include: { bidder: true }
            }
          }
        },
        files: true,
        _count: {
          select: { groups: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tenders);
  } catch (error) {
    next(error);
  }
});

// Get single tender
router.get('/:id', async (req, res, next) => {
  try {
    const tender = await prisma.tender.findUnique({
      where: { id: parseInt(req.params.id) },
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
        files: true
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
  upload.single('file'),
  [
    body('tenderNumber').optional(),
    body('exchangeRate').optional(),
    body('location').optional(),
    body('date').optional(),
    body('title').optional(),
    body('responsibleBody').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenderNumber, exchangeRate, location, date, title, responsibleBody, tenderType, originalTenderId, harajRound } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Excel file is required' });
      }

      const result = await prisma.$transaction(async (tx) => {
        // Parse Excel first to get metadata
        const tempFilePath = req.file.path;
        const parsedData = await parseExcelFile(tempFilePath, null);
        const meta = parsedData.tenderMeta || {};

        // Use Excel metadata as primary source, fallback to form data
        const finalTenderNumber = meta.tenderNumber || tenderNumber || 'TND-' + Date.now();
        const finalExchangeRate = meta.exchangeRate ? parseFloat(meta.exchangeRate) : (exchangeRate ? parseFloat(exchangeRate) : 1);
        const finalTitle = meta.title || title || null;
        const finalLocation = meta.location || location || null;
        const finalResponsibleBody = meta.responsibleBody || responsibleBody || null;
        
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
            status: 'OPEN'
          }
        });

        await tx.file.create({
          data: {
            tenderId: tender.id,
            filename: req.file.originalname,
            path: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size
          }
        });

        const effectiveExchangeRate = finalExchangeRate;

        for (const groupData of parsedData.groups) {
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

          // Use group-specific exchange rate if available, otherwise use tender-level
          const groupExchangeRate = groupMeta.exchangeRate ? parseFloat(groupMeta.exchangeRate) : effectiveExchangeRate;

          let groupBasePrice = 0;
          for (const itemData of groupData.items) {
            let unitPrice;
            if (tenderType === 'HARAJ') {
              // For Haraj: use LOWEST of CIF, FOB, TAX
              const lowestPrice = Math.min(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0);
              unitPrice = lowestPrice * groupExchangeRate;
            } else {
              // For Auction: use HIGHEST of CIF, FOB, TAX (current round price)
              unitPrice = Math.max(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0) * groupExchangeRate;
            }
            const totalPrice = unitPrice * (itemData.totalQuantity || 0);

            await tx.item.create({
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
                unitPrice,
                totalPrice
              }
            });

            groupBasePrice += totalPrice;
          }

          await tx.group.update({
            where: { id: group.id },
            data: { 
              basePrice: groupBasePrice,
              harajPrice: tenderType === 'HARAJ' ? groupBasePrice : null
            }
          });
        }

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

      return await tx.tender.findUnique({
        where: { id: tender.id },
        include: { groups: { include: { items: true } }, files: true }
      });
    });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Update tender
router.patch(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const { title, tenderNumber, exchangeRate, location, date, status, responsibleBody } = req.body;

      const tender = await prisma.tender.update({
        where: { id: parseInt(req.params.id) },
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
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const tenderId = parseInt(req.params.id);

      // Check if tender exists
      const tender = await prisma.tender.findUnique({
        where: { id: tenderId }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
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