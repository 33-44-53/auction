const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all bidders
router.get('/', async (req, res, next) => {
  try {
    const bidders = await prisma.bidder.findMany({
      include: {
        groups: {
          include: { group: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(bidders);
  } catch (error) {
    next(error);
  }
});

// Get single bidder
router.get('/:id', async (req, res, next) => {
  try {
    const bidder = await prisma.bidder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        groups: {
          include: { 
            group: {
              include: {
                bids: {
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        },
        bids: {
          include: { group: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }

    res.json(bidder);
  } catch (error) {
    next(error);
  }
});

// Create bidder
router.post(
  '/',
  authorize('ADMIN', 'STAFF'),
  [
    body('name').notEmpty(),
    body('companyName').notEmpty(),
    body('phone').notEmpty(),
    body('email').optional().isEmail(),
    body('address').optional(),
    body('tin').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, companyName, phone, email, address, tin } = req.body;

      const bidder = await prisma.bidder.create({
        data: {
          name,
          companyName,
          phone,
          email,
          address,
          tin
        }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'CREATE',
          entity: 'Bidder',
          entityId: bidder.id,
          details: JSON.stringify({ name, companyName }),
          ipAddress: req.ip
        }
      });

      res.status(201).json(bidder);
    } catch (error) {
      next(error);
    }
  }
);

// Update bidder
router.patch(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const bidderId = parseInt(req.params.id);
      const { name, companyName, phone, email, address, tin } = req.body;

      const bidder = await prisma.bidder.update({
        where: { id: bidderId },
        data: {
          ...(name && { name }),
          ...(companyName && { companyName }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
          ...(tin && { tin })
        }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'UPDATE',
          entity: 'Bidder',
          entityId: bidderId,
          details: JSON.stringify(req.body),
          ipAddress: req.ip
        }
      });

      res.json(bidder);
    } catch (error) {
      next(error);
    }
  }
);

// Delete bidder
router.delete(
  '/:id',
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const bidderId = parseInt(req.params.id);

      const bidder = await prisma.bidder.findUnique({
        where: { id: bidderId }
      });

      if (!bidder) {
        return res.status(404).json({ error: 'Bidder not found' });
      }

      // Check if bidder has any bids
      const bidCount = await prisma.bid.count({
        where: { bidderId }
      });

      if (bidCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete bidder with existing bids' 
        });
      }

      await prisma.bidder.delete({
        where: { id: bidderId }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'DELETE',
          entity: 'Bidder',
          entityId: bidderId,
          details: JSON.stringify({ name: bidder.name }),
          ipAddress: req.ip
        }
      });

      res.json({ message: 'Bidder deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;