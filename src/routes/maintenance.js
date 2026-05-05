const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');

// Recalculate all item prices with correct exchange rates
router.post('/recalculate-prices', authenticate, async (req, res, next) => {
  try {
    console.log('Starting price recalculation for all items...');

    // Get all groups with their items and tender info
    const groups = await prisma.group.findMany({
      include: {
        items: true,
        tender: true
      }
    });

    let totalItemsUpdated = 0;
    let totalGroupsUpdated = 0;
    const updates = [];

    for (const group of groups) {
      let groupBasePrice = 0;
      const itemUpdates = [];

      for (const item of group.items) {
        const exchangeRate = item.exchangeRate;
        
        if (!exchangeRate || exchangeRate === 0) {
          updates.push({
            group: group.code,
            item: item.name,
            status: 'skipped',
            reason: 'No exchange rate'
          });
          continue;
        }

        // Determine which price to use based on current round
        let selectedPrice;
        if (group.currentRound === 'HARAJ') {
          selectedPrice = Math.min(item.cif || 0, item.fob || 0, item.tax || 0);
        } else {
          const prices = {
            CIF: item.cif || 0,
            FOB: item.fob || 0,
            TAX: item.tax || 0
          };
          selectedPrice = prices[group.currentRound] || 0;
        }

        // Calculate correct prices
        const correctUnitPrice = selectedPrice * exchangeRate;
        const correctTotalPrice = correctUnitPrice * item.totalQuantity;

        // Check if prices need updating
        const needsUpdate = 
          Math.abs(item.unitPrice - correctUnitPrice) > 0.01 ||
          Math.abs(item.totalPrice - correctTotalPrice) > 0.01;

        if (needsUpdate) {
          itemUpdates.push({
            id: item.id,
            unitPrice: correctUnitPrice,
            totalPrice: correctTotalPrice
          });

          updates.push({
            group: group.code,
            item: item.name,
            status: 'updated',
            oldUnitPrice: item.unitPrice,
            newUnitPrice: correctUnitPrice,
            oldTotalPrice: item.totalPrice,
            newTotalPrice: correctTotalPrice
          });

          totalItemsUpdated++;
        }

        groupBasePrice += correctTotalPrice;
      }

      // Update all items in this group
      for (const update of itemUpdates) {
        await prisma.item.update({
          where: { id: update.id },
          data: {
            unitPrice: update.unitPrice,
            totalPrice: update.totalPrice
          }
        });
      }

      // Update group base price
      const needsGroupUpdate = Math.abs(group.basePrice - groupBasePrice) > 0.01;
      if (needsGroupUpdate) {
        await prisma.group.update({
          where: { id: group.id },
          data: { basePrice: groupBasePrice }
        });
        totalGroupsUpdated++;
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'RECALCULATE_PRICES',
        entity: 'System',
        entityId: null,
        details: JSON.stringify({ 
          itemsUpdated: totalItemsUpdated, 
          groupsUpdated: totalGroupsUpdated 
        }),
        ipAddress: req.ip
      }
    });

    res.json({
      success: true,
      message: 'Price recalculation completed',
      summary: {
        itemsUpdated: totalItemsUpdated,
        groupsUpdated: totalGroupsUpdated,
        totalGroups: groups.length
      },
      updates: updates.slice(0, 50) // Return first 50 updates for display
    });

  } catch (error) {
    console.error('Error during price recalculation:', error);
    next(error);
  }
});

module.exports = router;
