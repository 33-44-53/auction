const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Public stats endpoint (no auth required)
router.get('/public', async (req, res, next) => {
  try {
    const [
      totalTenders,
      totalBidders,
      soldGroups,
      totalGroups
    ] = await Promise.all([
      prisma.tender.count(),
      prisma.bidder.count(),
      prisma.group.count({ where: { status: 'SOLD' } }),
      prisma.group.count()
    ]);

    const totalValue = await prisma.group.aggregate({ _sum: { basePrice: true } });

    const successRate = totalGroups > 0 ? Math.round((soldGroups / totalGroups) * 100) : 0;

    res.json({
      totalTenders,
      totalBidders,
      successRate,
      totalValue: totalValue._sum.basePrice || 0
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    // Build where clause based on user role
    const tenderWhere = req.user?.role === 'STAFF' 
      ? { createdBy: req.user.id } 
      : {};
    
    const bidderWhere = req.user?.role === 'STAFF' 
      ? { createdBy: req.user.id } 
      : {};

    // For groups, filter by tender ownership
    const groupWhere = req.user?.role === 'STAFF'
      ? { tender: { createdBy: req.user.id } }
      : {};

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
      prisma.tender.count({ where: tenderWhere }),
      prisma.tender.count({ where: { ...tenderWhere, status: 'OPEN' } }),
      prisma.group.count({ where: { ...groupWhere, status: 'SOLD' } }),
      prisma.group.count({ where: groupWhere }),
      prisma.bidder.count({ where: bidderWhere }),
      prisma.bid.count(),
      prisma.tender.findMany({
        where: tenderWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { groups: true } } }
      }),
      prisma.group.groupBy({
        by: ['status'],
        where: groupWhere,
        _count: { status: true }
      })
    ]);

    const totalValue = await prisma.group.aggregate({ 
      where: groupWhere,
      _sum: { basePrice: true } 
    });
    const soldValue = await prisma.group.aggregate({
      where: { ...groupWhere, status: 'SOLD' },
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
