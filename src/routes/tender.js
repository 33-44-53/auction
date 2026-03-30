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
    body('tenderNumber').notEmpty(),
    body('exchangeRate').isFloat({ min: 0 }),
    body('location').optional(),
    body('date').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tenderNumber, exchangeRate, location, date, title, responsibleBody, tenderType, originalTenderId, harajRound } = req.body;

      const result = await prisma.$transaction(async (tx) => {
        const tender = await tx.tender.create({
          data: {
            tenderNumber,
            exchangeRate: parseFloat(exchangeRate),
            location: location || null,
            date: date ? new Date(date) : null,
            title: title || null,
            responsibleBody: responsibleBody || null,
            tenderType: tenderType || 'AUCTION',
            originalTenderId: originalTenderId ? parseInt(originalTenderId) : null,
            harajRound: harajRound ? parseInt(harajRound) : 1,
            status: 'OPEN'
          }
        });

        if (req.file) {
          await tx.file.create({
            data: {
              tenderId: tender.id,
              filename: req.file.originalname,
              path: req.file.path,
              mimeType: req.file.mimetype,
              size: req.file.size
            }
          });

          const parsedData = await parseExcelFile(req.file.path, tender.id);
          const meta = parsedData.tenderMeta || {};

          // Backfill tender fields from Excel metadata if not provided in form
          const updates = {};
          if (!title && meta.title)                       updates.title = meta.title;
          if (!location && meta.location)                 updates.location = meta.location;
          if (!responsibleBody && meta.responsibleBody)   updates.responsibleBody = meta.responsibleBody;
          if (!date && meta.date)                         updates.date = new Date(meta.date);
          if (Object.keys(updates).length > 0) {
            await tx.tender.update({ where: { id: tender.id }, data: updates });
          }

          const effectiveExchangeRate = parseFloat(exchangeRate);

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

            const group = await tx.group.create({
              data: {
                tenderId: tender.id,
                code: groupData.code,
                name: groupData.name,
                currentRound: initialRound,
                roundNumber: 1,
                status: 'OPEN'
              }
            });

            let groupBasePrice = 0;
            for (const itemData of groupData.items) {
              let unitPrice;
              if (tenderType === 'HARAJ') {
                // For Haraj: use LOWEST of CIF, FOB, TAX
                const lowestPrice = Math.min(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0);
                unitPrice = lowestPrice * effectiveExchangeRate;
              } else {
                // For Auction: use HIGHEST of CIF, FOB, TAX (Round 1)
                unitPrice = Math.max(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0) * effectiveExchangeRate;
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
              details: JSON.stringify({ tenderNumber, file: req.file.originalname, groupsCount: parsedData.groups.length }),
              ipAddress: req.ip
            }
          });
        }

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