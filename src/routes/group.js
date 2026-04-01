const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const { authorize } = require('../middleware/auth');

// Determine which price type is highest, middle, lowest
function getPricePriority(cif, fob, tax) {
  const prices = [
    { name: 'CIF', value: cif },
    { name: 'FOB', value: fob },
    { name: 'TAX', value: tax }
  ];
  prices.sort((a, b) => b.value - a.value);
  return [prices[0].name, prices[1].name, prices[2].name]; // [highest, middle, lowest]
}

function calcUnitPrice(cif, fob, tax, round, exchangeRate) {
  const prices = { CIF: cif, FOB: fob, TAX: tax };
  return prices[round] * exchangeRate;
}

// Add item to group manually
router.post('/:id/items', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { itemCode, serialNumber, name, itemType, brand, country, unit,
      warehouse1, warehouse2, warehouse3, fob, cif, tax } = req.body;

    if (!itemCode || !name || !unit) {
      return res.status(400).json({ error: 'itemCode, name, unit are required' });
    }

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const cifVal = parseFloat(cif) || 0;
    const fobVal = parseFloat(fob) || 0;
    const taxVal = parseFloat(tax) || 0;
    const wh1 = parseInt(warehouse1) || 0;
    const wh2 = parseInt(warehouse2) || 0;
    const wh3 = parseInt(warehouse3) || 0;
    const totalQuantity = wh1 + wh2 + wh3;
    const exchangeRate = group.exchangeRate || group.tender.exchangeRate;
    const unitPrice = calcUnitPrice(cifVal, fobVal, taxVal, group.currentRound, exchangeRate);
    const totalPrice = unitPrice * totalQuantity;

    const item = await prisma.item.create({
      data: { groupId, itemCode, serialNumber, name, itemType, brand, country, unit,
        warehouse1: wh1, warehouse2: wh2, warehouse3: wh3, totalQuantity,
        fob: fobVal, cif: cifVal, tax: taxVal, unitPrice, totalPrice }
    });

    const allItems = await prisma.item.findMany({ where: { groupId } });
    const basePrice = allItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
    await prisma.group.update({ where: { id: groupId }, data: { basePrice } });

    res.status(201).json(item);
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
});

// Update item in group
router.patch('/:id/items/:itemId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const itemId = parseInt(req.params.itemId);
    const { itemCode, serialNumber, name, itemType, brand, country, unit,
      warehouse1, warehouse2, warehouse3, fob, cif, tax } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const cifVal = parseFloat(cif) || 0;
    const fobVal = parseFloat(fob) || 0;
    const taxVal = parseFloat(tax) || 0;
    const wh1 = parseInt(warehouse1) || 0;
    const wh2 = parseInt(warehouse2) || 0;
    const wh3 = parseInt(warehouse3) || 0;
    const totalQuantity = wh1 + wh2 + wh3;
    const exchangeRate = group.exchangeRate || group.tender.exchangeRate;
    const unitPrice = calcUnitPrice(cifVal, fobVal, taxVal, group.currentRound, exchangeRate);
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
        warehouse1: wh1, warehouse2: wh2, warehouse3: wh3, totalQuantity,
        fob: fobVal, cif: cifVal, tax: taxVal, unitPrice, totalPrice
      }
    });

    const allItems = await prisma.item.findMany({ where: { groupId } });
    const basePrice = allItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
    await prisma.group.update({ where: { id: groupId }, data: { basePrice } });

    res.json(item);
  } catch (error) { next(error); }
});

// Create new group in a tender
router.post('/', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const { tenderId, code, name, vehiclePlate } = req.body;
    if (!tenderId || !code) return res.status(400).json({ error: 'tenderId and code required' });
    
    // Default to CIF for new groups (will be determined by items)
    const group = await prisma.group.create({
      data: { tenderId: parseInt(tenderId), code, name, vehiclePlate, currentRound: 'CIF', status: 'OPEN', basePrice: 0 }
    });
    res.status(201).json(group);
  } catch (error) { next(error); }
});

// Remove bidder from group
router.delete('/:id/bidders/:bidderId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const bidderId = parseInt(req.params.bidderId);
    await prisma.bidderGroup.deleteMany({ where: { groupId, bidderId } });
    res.json({ message: 'Bidder removed from group' });
  } catch (error) { next(error); }
});

// Get group details
router.get('/:id', async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tender: true, items: true,
        bids: { include: { bidder: true }, orderBy: { bidPrice: 'desc' } },
        parentGroup: true, childGroups: true,
        bidders: { include: { bidder: true } }
      }
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (error) { next(error); }
});

// Add bidder to group
router.post('/:id/bidders', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { bidderId } = req.body;
    if (!bidderId) return res.status(400).json({ error: 'bidderId is required' });

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open for bidding' });

    const bidder = await prisma.bidder.findUnique({ where: { id: bidderId } });
    if (!bidder) return res.status(404).json({ error: 'Bidder not found' });

    const bidderGroup = await prisma.bidderGroup.create({ data: { bidderId, groupId }, include: { bidder: true } });
    await prisma.auditLog.create({ data: { userId: req.userId, action: 'ADD_BIDDER', entity: 'Group', entityId: groupId, details: JSON.stringify({ bidderId, bidderName: bidder.name }), ipAddress: req.ip } });
    res.status(201).json(bidderGroup);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Bidder already assigned to this group' });
    next(error);
  }
});

// Submit bid
router.post('/:id/bids', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { bidderId, bidPrice } = req.body;
    if (!bidderId || bidPrice === undefined) return res.status(400).json({ error: 'bidderId and bidPrice are required' });

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open for bidding' });
    if (group.basePrice && bidPrice < group.basePrice) return res.status(400).json({ error: `Bid price must be at least ${group.basePrice}` });

    const bidder = await prisma.bidder.findUnique({ where: { id: bidderId } });
    if (!bidder) return res.status(404).json({ error: 'Bidder not found' });

    const existing = await prisma.bidderGroup.findFirst({ where: { groupId, bidderId } });
    if (!existing) await prisma.bidderGroup.create({ data: { bidderId, groupId } });

    const round = group.tender.tenderType === 'HARAJ' ? 'HARAJ' : group.currentRound;
    const existingBid = await prisma.bid.findFirst({ where: { groupId, bidderId, round } });
    let bid;
    if (existingBid) {
      bid = await prisma.bid.update({ where: { id: existingBid.id }, data: { bidPrice }, include: { bidder: true } });
    } else {
      bid = await prisma.bid.create({ data: { groupId, bidderId, bidPrice, round }, include: { bidder: true } });
    }

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'BID', entity: 'Group', entityId: groupId, details: JSON.stringify({ bidderId, bidPrice, round: group.currentRound }), ipAddress: req.ip } });
    res.status(201).json(bid);
  } catch (error) { next(error); }
});

// Delete bid
router.delete('/:id/bids/:bidId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const bidId = parseInt(req.params.bidId);
    await prisma.bid.delete({ where: { id: bidId } });
    res.json({ message: 'Bid deleted' });
  } catch (error) { next(error); }
});

// Move to next round
router.post('/:id/next-round', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true, items: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open' });
    if (group.items.length === 0) return res.status(400).json({ error: 'Group has no items' });

    // Determine round priority from first item
    const firstItem = group.items[0];
    const [round1, round2, round3] = getPricePriority(firstItem.cif, firstItem.fob, firstItem.tax);
    const rounds = [round1, round2, round3];
    
    const currentIndex = rounds.indexOf(group.currentRound);
    if (currentIndex >= rounds.length - 1) return res.status(400).json({ error: 'Already at final round' });

    const nextRound = rounds[currentIndex + 1];
    const exchangeRate = group.exchangeRate || group.tender.exchangeRate;

    let newBasePrice = 0;
    for (const item of group.items) {
      const unitPrice = calcUnitPrice(item.cif, item.fob, item.tax, nextRound, exchangeRate);
      const totalPrice = unitPrice * item.totalQuantity;
      newBasePrice += totalPrice;
      await prisma.item.update({ where: { id: item.id }, data: { unitPrice, totalPrice } });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { currentRound: nextRound, roundNumber: group.roundNumber + 1, basePrice: newBasePrice }
    });

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'NEXT_ROUND', entity: 'Group', entityId: groupId, details: JSON.stringify({ fromRound: group.currentRound, toRound: nextRound, newBasePrice }), ipAddress: req.ip } });
    res.json({ message: `Moved to ${nextRound}`, group: updatedGroup, newBasePrice });
  } catch (error) { next(error); }
});

// Move to previous round
router.post('/:id/prev-round', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true, items: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open' });
    if (group.items.length === 0) return res.status(400).json({ error: 'Group has no items' });

    // Determine round priority from first item
    const firstItem = group.items[0];
    const [round1, round2, round3] = getPricePriority(firstItem.cif, firstItem.fob, firstItem.tax);
    const rounds = [round1, round2, round3];
    
    const currentIndex = rounds.indexOf(group.currentRound);
    if (currentIndex <= 0) return res.status(400).json({ error: 'Already at first round' });

    const prevRound = rounds[currentIndex - 1];
    const exchangeRate = group.exchangeRate || group.tender.exchangeRate;

    let newBasePrice = 0;
    for (const item of group.items) {
      const unitPrice = calcUnitPrice(item.cif, item.fob, item.tax, prevRound, exchangeRate);
      const totalPrice = unitPrice * item.totalQuantity;
      newBasePrice += totalPrice;
      await prisma.item.update({ where: { id: item.id }, data: { unitPrice, totalPrice } });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { currentRound: prevRound, roundNumber: group.roundNumber - 1, basePrice: newBasePrice }
    });

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'PREV_ROUND', entity: 'Group', entityId: groupId, details: JSON.stringify({ fromRound: group.currentRound, toRound: prevRound, newBasePrice }), ipAddress: req.ip } });
    res.json({ message: `Moved to ${prevRound}`, group: updatedGroup, newBasePrice });
  } catch (error) { next(error); }
});

// Split group
router.post('/:id/split', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { splitCount, itemAssignments } = req.body;
    if (!splitCount || !itemAssignments) return res.status(400).json({ error: 'splitCount and itemAssignments are required' });

    const originalGroup = await prisma.group.findUnique({ where: { id: groupId }, include: { items: true } });
    if (!originalGroup) return res.status(404).json({ error: 'Group not found' });
    if (originalGroup.status !== 'OPEN') return res.status(400).json({ error: 'Only open groups can be split' });

    await prisma.group.update({ where: { id: groupId }, data: { status: 'SPLIT' } });

    const newGroups = [];
    const letters = 'ABCDEFGHIJ'.split('');
    for (let i = 0; i < splitCount; i++) {
      const newGroup = await prisma.group.create({
        data: { tenderId: originalGroup.tenderId, code: `${originalGroup.code}${letters[i]}`, name: `${originalGroup.name || originalGroup.code} - Part ${letters[i]}`, parentGroupId: groupId, currentRound: originalGroup.currentRound, status: 'OPEN' }
      });
      newGroups.push(newGroup);
    }

    for (let i = 0; i < itemAssignments.length; i++) {
      const itemIds = itemAssignments[i].itemIds || [];
      if (itemIds.length > 0) await prisma.item.updateMany({ where: { id: { in: itemIds } }, data: { groupId: newGroups[i].id } });
    }

    for (const newGroup of newGroups) {
      const items = await prisma.item.findMany({ where: { groupId: newGroup.id } });
      const basePrice = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      await prisma.group.update({ where: { id: newGroup.id }, data: { basePrice } });
    }

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'SPLIT_GROUP', entity: 'Group', entityId: groupId, details: JSON.stringify({ splitCount, newGroups: newGroups.map(g => g.code) }), ipAddress: req.ip } });
    res.status(201).json({ message: 'Group split successfully', originalGroup: { id: groupId, code: originalGroup.code, status: 'SPLIT' }, newGroups });
  } catch (error) { next(error); }
});

// Update group
router.patch('/:id', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { code, name, status, basePrice, vehiclePlate } = req.body;
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { ...(code && { code }), ...(name && { name }), ...(status && { status }), ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }), ...(vehiclePlate !== undefined && { vehiclePlate }) }
    });
    res.json(group);
  } catch (error) { next(error); }
});

// Close group (Auction or Haraj)
router.post('/:id/close', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open' });

    const round = group.tender.tenderType === 'HARAJ' ? 'HARAJ' : group.currentRound;
    const bids = await prisma.bid.findMany({ where: { groupId, round }, orderBy: { bidPrice: 'desc' }, include: { bidder: true } });
    if (bids.length === 0) return res.status(400).json({ error: 'No bids found for this group' });

    const winner = bids[0];
    await prisma.bid.updateMany({ where: { groupId, round }, data: { isWinner: false } });
    await prisma.bid.update({ where: { id: winner.id }, data: { isWinner: true } });
    await prisma.group.update({ where: { id: groupId }, data: { status: 'SOLD', winnerBidderId: winner.bidderId, winnerPrice: winner.bidPrice, soldPrice: winner.bidPrice } });

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'CLOSE_GROUP', entity: 'Group', entityId: groupId, details: JSON.stringify({ winnerBidderId: winner.bidderId, winnerName: winner.bidder.name, winnerPrice: winner.bidPrice, round }), ipAddress: req.ip } });
    res.json({ message: 'Group closed successfully', winner: { bidderId: winner.bidderId, bidderName: winner.bidder.name, price: winner.bidPrice } });
  } catch (error) { next(error); }
});

// Send unsold group to Haraj (converts group in-place, no separate tender needed)
router.post('/:id/send-to-haraj', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { harajPrice, harajRound } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { items: true, tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group must be OPEN to send to Haraj' });

    // Store previous round before converting to HARAJ
    const previousRound = group.currentRound;

    // Calculate Haraj price: use lowest of CIF, FOB, TAX for each item
    let calculatedHarajPrice = 0;
    if (group.items.length > 0) {
      const exchangeRate = group.exchangeRate || group.tender.exchangeRate;
      for (const item of group.items) {
        const lowestPrice = Math.min(item.cif || 0, item.fob || 0, item.tax || 0);
        const unitPrice = lowestPrice * exchangeRate;
        const totalPrice = unitPrice * item.totalQuantity;
        calculatedHarajPrice += totalPrice;
      }
    }

    const price = parseFloat(harajPrice) || calculatedHarajPrice || 0;
    const round = parseInt(harajRound) || 1;

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        currentRound: 'HARAJ',
        harajPrice: price,
        basePrice: price,
        roundNumber: round,
        previousRound: previousRound  // Store for potential revert
      }
    });

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'SEND_TO_HARAJ', entity: 'Group', entityId: groupId, details: JSON.stringify({ harajPrice: price, harajRound: round, calculatedFromLowestPrice: !harajPrice, previousRound }), ipAddress: req.ip } });
    res.json({ message: 'Group converted to Haraj', group: updatedGroup, calculatedHarajPrice });
  } catch (error) { next(error); }
});

// Revert from Haraj back to normal rounds (CIF/FOB/TAX)
router.post('/:id/revert-from-haraj', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { items: true, tender: true } });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.currentRound !== 'HARAJ') return res.status(400).json({ error: 'Group is not in HARAJ mode' });
    if (group.items.length === 0) return res.status(400).json({ error: 'Group has no items' });

    // Determine which round to revert to
    const firstItem = group.items[0];
    const [round1, round2, round3] = getPricePriority(firstItem.cif, firstItem.fob, firstItem.tax);
    
    // Use previousRound if available, otherwise start from highest round
    const revertToRound = group.previousRound && [round1, round2, round3].includes(group.previousRound) 
      ? group.previousRound 
      : round1;

    const exchangeRate = group.exchangeRate || group.tender.exchangeRate;

    // Recalculate prices based on the reverted round
    let newBasePrice = 0;
    for (const item of group.items) {
      const unitPrice = calcUnitPrice(item.cif, item.fob, item.tax, revertToRound, exchangeRate);
      const totalPrice = unitPrice * item.totalQuantity;
      newBasePrice += totalPrice;
      await prisma.item.update({ where: { id: item.id }, data: { unitPrice, totalPrice } });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        currentRound: revertToRound,
        basePrice: newBasePrice,
        harajPrice: null,
        previousRound: null,
        roundNumber: 1
      }
    });

    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'REVERT_FROM_HARAJ', 
        entity: 'Group', 
        entityId: groupId, 
        details: JSON.stringify({ 
          fromRound: 'HARAJ', 
          toRound: revertToRound, 
          newBasePrice 
        }), 
        ipAddress: req.ip 
      } 
    });

    res.json({ 
      message: `Reverted from Haraj to ${revertToRound}`, 
      group: updatedGroup, 
      newBasePrice 
    });
  } catch (error) { next(error); }
});

// Reopen a SOLD or CLOSED group
router.post('/:id/reopen', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status === 'OPEN') return res.status(400).json({ error: 'Group is already open' });
    if (group.status === 'SPLIT') return res.status(400).json({ error: 'Cannot reopen a split group' });
    if (group.status === 'YASBELA') return res.status(400).json({ error: 'Cannot reopen a Yasbela group' });

    // Clear winner information and reopen
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        status: 'OPEN',
        winnerBidderId: null,
        winnerPrice: null,
        soldPrice: null
      }
    });

    // Clear winner flags from all bids
    await prisma.bid.updateMany({
      where: { groupId },
      data: { isWinner: false }
    });

    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'REOPEN_GROUP', 
        entity: 'Group', 
        entityId: groupId, 
        details: JSON.stringify({ 
          previousStatus: group.status,
          newStatus: 'OPEN'
        }), 
        ipAddress: req.ip 
      } 
    });

    res.json({ 
      message: 'Group reopened successfully', 
      group: updatedGroup
    });
  } catch (error) { next(error); }
});

// Yasbela: winner cancels — apply 5% penalty, reopen group for re-auction
router.post('/:id/yasbela', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { reason, yasbelaTenderId } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { items: true, tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to apply Yasbela' });
    if (!group.winnerPrice) return res.status(400).json({ error: 'No winner price found' });

    const penalty = group.winnerPrice * 0.05;

    // Mark original group as YASBELA
    await prisma.group.update({
      where: { id: groupId },
      data: { status: 'YASBELA', yasbelaPenalty: penalty, yasbelaReason: reason || null, yasbelaDate: new Date() }
    });

    // Determine target tender: yasbelaTenderId or same tender
    const targetTenderId = yasbelaTenderId ? parseInt(yasbelaTenderId) : group.tenderId;
    const targetTender = await prisma.tender.findUnique({ where: { id: targetTenderId } });
    if (!targetTender) return res.status(404).json({ error: 'Target tender not found' });

    // Determine initial round based on tender type
    let initialRound = group.currentRound;
    if (targetTender.tenderType === 'HARAJ') initialRound = 'HARAJ';
    else if (targetTender.tenderType === 'AUCTION' || targetTender.tenderType === 'YASBELA') {
      // Use same round logic as original auction
      if (group.items.length > 0) {
        const fi = group.items[0];
        const prices = [{ name: 'CIF', value: fi.cif }, { name: 'FOB', value: fi.fob }, { name: 'TAX', value: fi.tax }];
        prices.sort((a, b) => b.value - a.value);
        initialRound = prices[0].name;
      }
    }

    // Create new group in target tender
    const newGroup = await prisma.group.create({
      data: {
        tenderId: targetTenderId,
        code: group.code,
        name: group.name,
        vehiclePlate: group.vehiclePlate,
        originalGroupId: groupId,
        basePrice: group.basePrice,
        harajPrice: targetTender.tenderType === 'HARAJ' ? group.basePrice : null,
        currentRound: initialRound,
        status: 'OPEN'
      }
    });

    // Copy items
    for (const item of group.items) {
      await prisma.item.create({
        data: {
          groupId: newGroup.id,
          itemCode: item.itemCode, serialNumber: item.serialNumber, name: item.name,
          itemType: item.itemType, brand: item.brand, country: item.country, unit: item.unit,
          warehouse1: item.warehouse1, warehouse2: item.warehouse2, warehouse3: item.warehouse3,
          totalQuantity: item.totalQuantity, fob: item.fob, cif: item.cif, tax: item.tax,
          unitPrice: item.unitPrice, totalPrice: item.totalPrice
        }
      });
    }

    await prisma.auditLog.create({ data: { userId: req.userId, action: 'YASBELA', entity: 'Group', entityId: groupId, details: JSON.stringify({ penalty, reason, newGroupId: newGroup.id, targetTenderId }), ipAddress: req.ip } });
    res.json({ message: 'Yasbela applied', penalty, newGroup });
  } catch (error) { next(error); }
});

// Delete group
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    const bidCount = await prisma.bid.count({ where: { groupId } });
    if (bidCount > 0) return res.status(400).json({ error: 'Cannot delete group with bids' });
    await prisma.group.delete({ where: { id: groupId } });
    res.json({ message: 'Group deleted successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
