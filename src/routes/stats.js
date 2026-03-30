const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res, next) => {
  try {
    const [
      totalTenders,
      openTenders,
      soldGroups,
      totalGroups,
      totalBidders,
      totalBids,
      recentTenders,
      groupsByStatus
    ] = await Promise.all([
      prisma.tender.count(),
      prisma.tender.count({ where: { status: 'OPEN' } }),
      prisma.group.count({ where: { status: 'SOLD' } }),
      prisma.group.count(),
      prisma.bidder.count(),
      prisma.bid.count(),
      prisma.tender.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { groups: true } } }
      }),
      prisma.group.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    const totalValue = await prisma.group.aggregate({ _sum: { basePrice: true } });
    const soldValue = await prisma.group.aggregate({
      where: { status: 'SOLD' },
      _sum: { basePrice: true }
    });

    res.json({
      user: { id: req.user.id, name: req.user.name, role: req.user.role },
      totalTenders,
      openTenders,
      closedTenders: totalTenders - openTenders,
      totalGroups,
      soldGroups,
      openGroups: totalGroups - soldGroups,
      totalBidders,
      totalBids,
      totalValue: totalValue._sum.basePrice || 0,
      soldValue: soldValue._sum.basePrice || 0,
      recentTenders,
      groupsByStatus
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
