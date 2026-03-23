const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

// List all users (admin only)
router.get('/', authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post(
  '/',
  authorize('ADMIN'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').isIn(['ADMIN', 'STAFF', 'VIEWER']).withMessage('Invalid role')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role } = req.body;

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return res.status(400).json({ error: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, password: hashed, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'CREATE_USER',
          entity: 'User',
          entityId: user.id,
          details: JSON.stringify({ name, email, role }),
          ipAddress: req.ip
        }
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Update user role (admin only)
router.patch('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only, cannot delete self)
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    if (targetId === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await prisma.user.delete({ where: { id: targetId } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
