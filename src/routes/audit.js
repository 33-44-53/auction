const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authorize } = require('../middleware/auth');

// Get audit logs (admin only)
router.get(
  '/',
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 50, userId, action, entity, startDate, endDate } = req.query;
      
      const where = {};
      
      if (userId) where.userId = parseInt(userId);
      if (action) where.action = action;
      if (entity) where.entity = entity;
      
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: { name: true, email: true, role: true }
            }
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.auditLog.count({ where })
      ]);

      res.json({
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get audit logs for specific entity
router.get(
  '/entity/:entity/:entityId',
  authorize('ADMIN', 'STAFF'),
  async (req, res, next) => {
    try {
      const { entity, entityId } = req.params;

      const logs = await prisma.auditLog.findMany({
        where: {
          entity,
          entityId: parseInt(entityId)
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

// Get current user's activity
router.get(
  '/my-activity',
  async (req, res, next) => {
    try {
      const { limit = 20 } = req.query;

      const logs = await prisma.auditLog.findMany({
        where: { userId: req.userId },
        orderBy: { timestamp: 'desc' },
        take: parseInt(limit),
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;