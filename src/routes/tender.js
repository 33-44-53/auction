const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');
const { parseExcelFile } = require('../utils/excelParser');

const prisma = new PrismaClient();

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
    const transaction = await prisma.$transaction(async (tx) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { tenderNumber, exchangeRate, location, date, title, responsibleBody, vehiclePlate } = req.body;

        // Create tender
        const tender = await tx.tender.create({
          data: {
            tenderNumber,
            exchangeRate: parseFloat(exchangeRate),
            location,
            date: date ? new Date(date) : null,
            title,
            responsibleBody,
            vehiclePlate,
            status: 'OPEN'
          }
        });

        // Handle file upload and parsing
        if (req.file) {
          // Save file record
          await tx.file.create({
            data: {
              tenderId: tender.id,
              filename: req.file.originalname,
              path: req.file.path,
              mimeType: req.file.mimetype,
              size: req.file.size
            }
          });

          // Parse Excel file
          const parsedData = await parseExcelFile(req.file.path, tender.id);
          
          // Create groups, items and calculate prices
          for (const groupData of parsedData.groups) {
            const group = await tx.group.create({
              data: {
                tenderId: tender.id,
                code: groupData.code,
                name: groupData.name,
                currentRound: 'CIF',
                roundNumber: 1,
                status: 'OPEN'
              }
            });

            // Calculate base price and create items
            let groupBasePrice = 0;
            for (const itemData of groupData.items) {
              // Price selection: MAX(CIF, FOB, TAX) - 3 Prices Logic
              const selectedPrice = Math.max(itemData.cif, itemData.fob, itemData.tax);
              
              // Calculate unit price and total price
              const unitPrice = selectedPrice * tender.exchangeRate;
              const totalPrice = unitPrice * itemData.totalQuantity;

              await tx.item.create({
                data: {
                  groupId: group.id,
                  itemCode: itemData.itemCode,
                  serialNumber: itemData.serialNumber,
                  name: itemData.name,
                  itemType: itemData.itemType,
                  brand: itemData.brand,
                  country: itemData.country,
                  unit: itemData.unit,
                  warehouse1: itemData.warehouse1,
                  warehouse2: itemData.warehouse2,
                  warehouse3: itemData.warehouse3,
                  totalQuantity: itemData.totalQuantity,
                  fob: itemData.fob,
                  cif: itemData.cif,
                  tax: itemData.tax,
                  unitPrice,
                  totalPrice
                }
              });

              groupBasePrice += totalPrice;
            }

            // Update group base price
            await tx.group.update({
              where: { id: group.id },
              data: { basePrice: groupBasePrice }
            });
          }

          // Log audit
          await tx.auditLog.create({
            data: {
              userId: req.userId,
              action: 'UPLOAD',
              entity: 'Tender',
              entityId: tender.id,
              details: JSON.stringify({ 
                tenderNumber,
                file: req.file.originalname,
                groupsCount: parsedData.groups.length
              }),
              ipAddress: req.ip
            }
          });
        }

        // Return created tender with relations
        return await tx.tender.findUnique({
          where: { id: tender.id },
          include: {
            groups: { include: { items: true } },
            files: true
          }
        });
      } catch (error) {
        throw error;
      }
    });

    res.status(201).json(transaction);
  }
);

// Update tender
router.patch(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const { title, tenderNumber, exchangeRate, location, date, status, responsibleBody, vehiclePlate } = req.body;

      const tender = await prisma.tender.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...(title && { title }),
          ...(tenderNumber && { tenderNumber }),
          ...(exchangeRate && { exchangeRate: parseFloat(exchangeRate) }),
          ...(location && { location }),
          ...(date && { date: new Date(date) }),
          ...(status && { status }),
          ...(responsibleBody && { responsibleBody }),
          ...(vehiclePlate && { vehiclePlate })
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