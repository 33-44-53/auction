const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

// Add item to group manually
router.post('/:id/items', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { 
      itemCode, serialNumber, name, itemType, brand, country, unit,
      warehouse1, warehouse2, warehouse3, fob, cif, tax 
    } = req.body;

    if (!itemCode || !name || !unit) {
      return res.status(400).json({ error: 'itemCode, name, unit are required' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true }
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const cifVal = parseFloat(cif) || 0;
    const fobVal = parseFloat(fob) || 0;
    const taxVal = parseFloat(tax) || 0;
    const wh1 = parseInt(warehouse1) || 0;
    const wh2 = parseInt(warehouse2) || 0;
    const wh3 = parseInt(warehouse3) || 0;
    const totalQuantity = wh1 + wh2 + wh3;

    // 3 Prices Logic: Select highest price
    const selectedPrice = Math.max(cifVal, fobVal, taxVal);
    const unitPrice = selectedPrice * group.tender.exchangeRate;
    const totalPrice = unitPrice * totalQuantity;

    const item = await prisma.item.create({
      data: {
        groupId,
        itemCode,
        serialNumber,
        name,
        itemType,
        brand,
        country,
        unit,
        warehouse1: wh1,
        warehouse2: wh2,
        warehouse3: wh3,
        totalQuantity,
        fob: fobVal,
        cif: cifVal,
        tax: taxVal,
        unitPrice,
        totalPrice
      }
    });

    // Recalculate group base price
    const allItems = await prisma.item.findMany({ where: { groupId } });
    const basePrice = allItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
    await prisma.group.update({ where: { id: groupId }, data: { basePrice } });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// Delete item from group
router.delete('/:id/items/:itemId', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);
    await prisma.item.delete({ where: { id: itemId } });
    const allItems = await prisma.item.findMany({ where: { groupId } });
    const basePrice = allItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
    await prisma.group.update({ where: { id: groupId }, data: { basePrice } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
});

// Update item in group
router.patch('/:id/items/:itemId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);
    const { 
      itemCode, serialNumber, name, itemType, brand, country, unit,
      warehouse1, warehouse2, warehouse3, fob, cif, tax 
    } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true }
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const cifVal = parseFloat(cif) || 0;
    const fobVal = parseFloat(fob) || 0;
    const taxVal = parseFloat(tax) || 0;
    const wh1 = parseInt(warehouse1) || 0;
    const wh2 = parseInt(warehouse2) || 0;
    const wh3 = parseInt(warehouse3) || 0;
    const totalQuantity = wh1 + wh2 + wh3;

    // 3 Prices Logic: Select highest price
    const selectedPrice = Math.max(cifVal, fobVal, taxVal);
    const unitPrice = selectedPrice * group.tender.exchangeRate;
    const totalPrice = unitPrice * totalQuantity;

    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(itemCode && { itemCode }),
        ...(serialNumber !== undefined && { serialNumber }),
        ...(name && { name }),
        ...(itemType !== undefined && { itemType }),
        ...(brand !== undefined && { brand }),
        ...(country !== undefined && { country }),
        ...(unit && { unit }),
        warehouse1: wh1,
        warehouse2: wh2,
        warehouse3: wh3,
        totalQuantity,
        fob: fobVal,
        cif: cifVal,
        tax: taxVal,
        unitPrice,
        totalPrice
      }
    });

    // Recalculate group base price
    const allItems = await prisma.item.findMany({ where: { groupId } });
    const basePrice = allItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
    await prisma.group.update({ where: { id: groupId }, data: { basePrice } });

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Create new group in a tender
router.post('/', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const { tenderId, code, name, vehiclePlate } = req.body;
    if (!tenderId || !code) return res.status(400).json({ error: 'tenderId and code required' });
    const group = await prisma.group.create({
      data: { tenderId: parseInt(tenderId), code, name, vehiclePlate, currentRound: 'CIF', status: 'OPEN', basePrice: 0 }
    });
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

// Remove bidder from group
router.delete('/:id/bidders/:bidderId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const bidderId = parseInt(req.params.bidderId);
    await prisma.bidderGroup.deleteMany({ where: { groupId, bidderId } });
    res.json({ message: 'Bidder removed from group' });
  } catch (error) {
    next(error);
  }
});

// Get group details
router.get('/:id', async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tender: true,
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
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
});

// Add bidder to group
router.post('/:id/bidders', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { bidderId } = req.body;

    if (!bidderId) {
      return res.status(400).json({ error: 'bidderId is required' });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId } });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'OPEN') {
      return res.status(400).json({ error: 'Group is not open for bidding' });
    }

    const bidder = await prisma.bidder.findUnique({ where: { id: bidderId } });

    if (!bidder) {
      return res.status(404).json({ error: 'Bidder not found' });
    }

    const bidderGroup = await prisma.bidderGroup.create({
      data: { bidderId, groupId },
      include: { bidder: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'ADD_BIDDER',
        entity: 'Group',
        entityId: groupId,
        details: JSON.stringify({ bidderId, bidderName: bidder.name }),
        ipAddress: req.ip
      }
    });

    res.status(201).json(bidderGroup);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bidder already assigned to this group' });
    }
    next(error);
  }
});

// Submit bid
router.post('/:id/bids', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { bidderId, bidPrice } = req.body;

    if (!bidderId || bidPrice === undefined) {
      return res.status(400).json({ error: 'bidderId and bidPrice are required' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'OPEN') {
      return res.status(400).json({ error: 'Group is not open for bidding' });
    }

    if (group.basePrice && bidPrice < group.basePrice) {
      return res.status(400).json({ error: `Bid price must be at least ${group.basePrice}` });
    }

    const bidderGroup = await prisma.bidderGroup.findFirst({
      where: { groupId, bidderId }
    });

    if (!bidderGroup) {
      return res.status(400).json({ error: 'Bidder not assigned to this group' });
    }

    const existingBid = await prisma.bid.findFirst({
      where: { groupId, bidderId, round: group.currentRound }
    });

    let bid;
    if (existingBid) {
      bid = await prisma.bid.update({
        where: { id: existingBid.id },
        data: { bidPrice },
        include: { bidder: true }
      });
    } else {
      bid = await prisma.bid.create({
        data: { groupId, bidderId, bidPrice, round: group.currentRound },
        include: { bidder: true }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'BID',
        entity: 'Group',
        entityId: groupId,
        details: JSON.stringify({ bidderId, bidPrice, round: group.currentRound }),
        ipAddress: req.ip
      }
    });

    res.status(201).json(bid);
  } catch (error) {
    next(error);
  }
});

// Select winner
router.post('/:id/select-winner', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { bidderId } = req.body;

    if (!bidderId) {
      return res.status(400).json({ error: 'bidderId is required' });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { bids: true }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'OPEN') {
      return res.status(400).json({ error: 'Group is not open' });
    }

    const currentRoundBids = group.bids.filter(b => b.round === group.currentRound);
    const winningBid = currentRoundBids.find(b => b.bidderId === bidderId);

    if (!winningBid) {
      return res.status(404).json({ error: 'No bid found for this bidder in current round' });
    }

    const highestBid = Math.max(...currentRoundBids.map(b => b.bidPrice));
    if (winningBid.bidPrice < highestBid) {
      return res.status(400).json({ error: `This is not the highest bid. Highest bid is ${highestBid}` });
    }

    await prisma.bid.updateMany({
      where: { groupId, round: group.currentRound },
      data: { isWinner: false }
    });

    await prisma.bid.update({
      where: { id: winningBid.id },
      data: { isWinner: true }
    });

    await prisma.group.update({
      where: { id: groupId },
      data: { status: 'SOLD' }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'SELECT_WINNER',
        entity: 'Group',
        entityId: groupId,
        details: JSON.stringify({ bidderId, bidPrice: winningBid.bidPrice, round: group.currentRound }),
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Winner selected successfully', winner: winningBid });
  } catch (error) {
    next(error);
  }
});

// Move to next round and recalculate base price using new round's prices
router.post('/:id/next-round', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true, items: true }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'OPEN') {
      return res.status(400).json({ error: 'Group is not open' });
    }

    const rounds = ['CIF', 'FOB', 'TAX'];
    const currentIndex = rounds.indexOf(group.currentRound);

    if (currentIndex >= rounds.length - 1) {
      return res.status(400).json({ error: 'Already at final round' });
    }

    const nextRound = rounds[currentIndex + 1];
    const nextRoundNumber = group.roundNumber + 1;
    const exchangeRate = group.tender.exchangeRate;

    // Recalculate item prices and base price for the new round using 3 Prices Logic
    let newBasePrice = 0;
    for (const item of group.items) {
      // Use the next round's price (FOB uses item.fob, TAX uses item.tax)
      const roundPrice = nextRound === 'FOB' ? item.fob : item.tax;
      
      // If using CIF (first round) or the next highest price
      const selectedPrice = Math.max(item.cif, item.fob, item.tax);
      const actualPrice = nextRound === 'CIF' ? item.cif : (nextRound === 'FOB' ? item.fob : item.tax);
      
      const unitPrice = actualPrice * exchangeRate;
      const totalPrice = unitPrice * item.totalQuantity;
      newBasePrice += totalPrice;
      
      await prisma.item.update({
        where: { id: item.id },
        data: { unitPrice, totalPrice }
      });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { 
        currentRound: nextRound, 
        roundNumber: nextRoundNumber,
        basePrice: newBasePrice 
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'NEXT_ROUND',
        entity: 'Group',
        entityId: groupId,
        details: JSON.stringify({ 
          fromRound: group.currentRound, 
          toRound: nextRound, 
          roundNumber: nextRoundNumber,
          newBasePrice 
        }),
        ipAddress: req.ip
      }
    });

    res.json({ 
      message: `Moved to ${nextRound} round (Round ${nextRoundNumber})`, 
      group: updatedGroup,
      newBasePrice 
    });
  } catch (error) {
    next(error);
  }
});

// Split group
router.post('/:id/split', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { splitCount, itemAssignments } = req.body;

    if (!splitCount || !itemAssignments) {
      return res.status(400).json({ error: 'splitCount and itemAssignments are required' });
    }

    const originalGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: { items: true }
    });

    if (!originalGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (originalGroup.status !== 'OPEN') {
      return res.status(400).json({ error: 'Only open groups can be split' });
    }

    await prisma.group.update({
      where: { id: groupId },
      data: { status: 'SPLIT' }
    });

    const newGroups = [];
    const letters = 'ABCDEFGHIJ'.split('');

    for (let i = 0; i < splitCount; i++) {
      const newCode = `${originalGroup.code}${letters[i]}`;

      const newGroup = await prisma.group.create({
        data: {
          tenderId: originalGroup.tenderId,
          code: newCode,
          name: `${originalGroup.name || originalGroup.code} - Part ${letters[i]}`,
          parentGroupId: groupId,
          currentRound: 'CIF',
          status: 'OPEN'
        }
      });

      newGroups.push(newGroup);
    }

    let newGroupIndex = 0;
    for (const assignment of itemAssignments) {
      const itemIds = assignment.itemIds || [];

      if (itemIds.length > 0) {
        await prisma.item.updateMany({
          where: { id: { in: itemIds } },
          data: { groupId: newGroups[newGroupIndex].id }
        });
      }

      newGroupIndex++;
    }

    for (const newGroup of newGroups) {
      const items = await prisma.item.findMany({ where: { groupId: newGroup.id } });
      const basePrice = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

      await prisma.group.update({
        where: { id: newGroup.id },
        data: { basePrice }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'SPLIT_GROUP',
        entity: 'Group',
        entityId: groupId,
        details: JSON.stringify({ splitCount, newGroups: newGroups.map(g => g.code) }),
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      message: 'Group split successfully',
      originalGroup: { id: groupId, code: originalGroup.code, status: 'SPLIT' },
      newGroups
    });
  } catch (error) {
    next(error);
  }
});

// Update group
router.patch('/:id', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { code, name, status, basePrice, vehiclePlate } = req.body;

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(status && { status }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(vehiclePlate !== undefined && { vehiclePlate })
      }
    });

    res.json(group);
  } catch (error) {
    next(error);
  }
});

// Delete group
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);

    const group = await prisma.group.findUnique({ where: { id: groupId } });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const bidCount = await prisma.bid.count({ where: { groupId } });

    if (bidCount > 0) {
      return res.status(400).json({ error: 'Cannot delete group with bids' });
    }

    await prisma.group.delete({ where: { id: groupId } });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;