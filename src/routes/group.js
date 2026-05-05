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

// Upload items from Excel into an existing group
router.post('/:id/upload-items-excel', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Use multer inline
    const multer = require('multer');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
        filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only Excel files allowed'));
      }
    }).single('file');

    upload(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { parseExcelFile } = require('../utils/excelParser');
      const parsedData = await parseExcelFile(req.file.path, null);
      const fs = require('fs');
      fs.unlink(req.file.path, () => {});

      // Collect all items from all parsed groups
      const allItems = parsedData.groups.flatMap(g => g.items);
      if (allItems.length === 0) return res.status(400).json({ error: 'No items found in Excel file' });

      const exchangeRate = group.exchangeRate || group.tender.exchangeRate;
      let basePrice = 0;

      for (const itemData of allItems) {
        const itemExchangeRate = itemData.exchangeRate;
        if (!itemExchangeRate) {
          return res.status(400).json({ error: `Item "${itemData.name}" is missing exchange rate. All items must have an exchange rate in the Excel file.` });
        }
        const prices = { CIF: itemData.cif || 0, FOB: itemData.fob || 0, TAX: itemData.tax || 0 };
        const unitPrice = (group.currentRound === 'HARAJ'
          ? Math.min(itemData.cif || 0, itemData.fob || 0, itemData.tax || 0)
          : prices[group.currentRound] || 0) * itemExchangeRate;
        const totalPrice = unitPrice * (itemData.totalQuantity || 0);

        await prisma.item.create({
          data: {
            groupId,
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
            exchangeRate: itemExchangeRate,
            expireDate: itemData.expireDate || null,
            unitPrice,
            totalPrice
          }
        });
        basePrice += totalPrice;
      }

      // Add to existing base price
      const existingItems = await prisma.item.findMany({ where: { groupId } });
      const newBasePrice = existingItems.reduce((s, i) => s + (i.totalPrice || 0), 0);
      await prisma.group.update({ where: { id: groupId }, data: { basePrice: newBasePrice } });

      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'UPLOAD_ITEMS',
          entity: 'Group',
          entityId: groupId,
          details: JSON.stringify({ itemsAdded: allItems.length }),
          ipAddress: req.ip
        }
      });

      res.status(201).json({ message: `${allItems.length} item(s) added`, itemCount: allItems.length });
    });
  } catch (error) { next(error); }
});

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
      warehouse1, warehouse2, warehouse3, fob, cif, tax, exchangeRate: itemExchangeRate, expireDate } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { tender: true } });
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const cifVal = parseFloat(cif) || 0;
    const fobVal = parseFloat(fob) || 0;
    const taxVal = parseFloat(tax) || 0;
    const wh1 = parseInt(warehouse1) || 0;
    const wh2 = parseInt(warehouse2) || 0;
    const wh3 = parseInt(warehouse3) || 0;
    const totalQuantity = wh1 + wh2 + wh3;
    
    // Use item-specific exchange rate if provided
    const exchangeRate = itemExchangeRate !== undefined 
      ? parseFloat(itemExchangeRate) 
      : null;
    
    if (!exchangeRate) {
      return res.status(400).json({ error: 'Exchange rate is required for each item' });
    }
    
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
        ...(expireDate !== undefined && { expireDate }),
        warehouse1: wh1, warehouse2: wh2, warehouse3: wh3, totalQuantity,
        fob: fobVal, cif: cifVal, tax: taxVal, 
        exchangeRate,
        unitPrice, 
        totalPrice
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

    // Find the next round group (group created from this one via next-round)
    const nextRoundGroup = await prisma.group.findFirst({
      where: { originalGroupId: group.id },
      include: { tender: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ ...group, nextRoundGroup: nextRoundGroup || null });
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

    const bidder = await prisma.bidder.findUnique({ where: { id: bidderId }, select: { id: true, name: true } });
    if (!bidder) return res.status(404).json({ error: 'Bidder not found' });

    const existing = await prisma.bidderGroup.findFirst({ where: { groupId, bidderId } });
    if (!existing) await prisma.bidderGroup.create({ data: { bidderId, groupId } });

    const round = group.tender.tenderType === 'HARAJ' ? 'HARAJ' : group.currentRound;
    const existingBid = await prisma.bid.findFirst({ where: { groupId, bidderId, round } });
    let bid;
    if (existingBid) {
      bid = await prisma.bid.update({ where: { id: existingBid.id }, data: { bidPrice }, include: { bidder: { select: { id: true, name: true } } } });
    } else {
      bid = await prisma.bid.create({ data: { groupId, bidderId, bidPrice, round }, include: { bidder: { select: { id: true, name: true } } } });
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

// Move to next round - creates new tender and moves group
router.post('/:id/next-round', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { targetTenderId, newGroupCode, nextHarajPrice, newTenderNumber } = req.body;
    
    const group = await prisma.group.findUnique({ 
      where: { id: groupId }, 
      include: { tender: true, items: true } 
    });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ error: 'Group is not open' });
    if (group.items.length === 0) return res.status(400).json({ error: 'Group has no items' });

    // Check if staying in same tender
    const stayInSameTender = targetTenderId === 'SAME';

    // Check if current round is HARAJ
    if (group.currentRound === 'HARAJ') {
      // Moving to next Haraj round
      const currentHarajRound = group.roundNumber || 1;
      const nextHarajRound = currentHarajRound + 1;
      
      // Determine target tender
      let newTenderId;
      if (stayInSameTender) {
        // Stay in current tender
        newTenderId = group.tenderId;
      } else if (targetTenderId) {
        newTenderId = parseInt(targetTenderId);
      } else {
        // Use provided tender number
        if (!newTenderNumber) return res.status(400).json({ error: 'newTenderNumber is required when creating a new tender' });
        
        // Create new tender for next Haraj round
        const newTender = await prisma.tender.create({
          data: {
            tenderNumber: newTenderNumber,
            title: group.tender.title,
            location: group.tender.location,
            exchangeRate: group.tender.exchangeRate,
            date: group.tender.date,
            responsibleBody: group.tender.responsibleBody,
            tenderType: 'HARAJ',
            harajRound: nextHarajRound,
            status: 'OPEN',
            createdBy: req.userId
          }
        });
        newTenderId = newTender.id;
      }

      // Use provided haraj price or default to 0
      const harajPrice = parseFloat(nextHarajPrice) || 0;

      // Create new group in new tender
      const newGroup = await prisma.group.create({
        data: {
          tenderId: newTenderId,
          code: newGroupCode || group.code,
          name: group.name,
          title: group.title,
          vehiclePlate: group.vehiclePlate,
          date: group.date,
          location: group.location,
          responsibleBody: group.responsibleBody,
          exchangeRate: group.exchangeRate,
          originalGroupId: groupId,
          basePrice: 0,
          harajPrice: harajPrice,
          currentRound: 'HARAJ',
          roundNumber: nextHarajRound,
          status: 'OPEN'
        }
      });

      // Copy items to new group
      for (const item of group.items) {
        await prisma.item.create({
          data: {
            groupId: newGroup.id,
            itemCode: item.itemCode,
            serialNumber: item.serialNumber,
            name: item.name,
            itemType: item.itemType,
            brand: item.brand,
            country: item.country,
            unit: item.unit,
            warehouse1: item.warehouse1,
            warehouse2: item.warehouse2,
            warehouse3: item.warehouse3,
            totalQuantity: item.totalQuantity,
            fob: item.fob,
            cif: item.cif,
            tax: item.tax,
            exchangeRate: item.exchangeRate,
            expireDate: item.expireDate,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }
        });
      }

      // Mark original group as moved to next round
      await prisma.group.update({
        where: { id: groupId },
        data: { status: 'CLOSED' }
      });

      // Ensure new group is OPEN
      await prisma.group.update({
        where: { id: newGroup.id },
        data: { status: 'OPEN' }
      });

      await prisma.auditLog.create({ 
        data: { 
          userId: req.userId, 
          action: 'NEXT_HARAJ_ROUND', 
          entity: 'Group', 
          entityId: groupId, 
          details: JSON.stringify({ 
            fromRound: currentHarajRound, 
            toRound: nextHarajRound, 
            newTenderId,
            newGroupId: newGroup.id,
            harajPrice,
            stayInSameTender 
          }), 
          ipAddress: req.ip 
        } 
      });

      return res.json({ 
        message: stayInSameTender 
          ? `Moved to Haraj Round ${nextHarajRound} in same tender` 
          : `Moved to Haraj Round ${nextHarajRound} in new tender`, 
        newGroup, 
        newTenderId,
        harajPrice 
      });
    }

    // Normal round progression (CIF/FOB/TAX)
    // Determine round priority from first item
    const firstItem = group.items[0];
    const [round1, round2, round3] = getPricePriority(firstItem.cif, firstItem.fob, firstItem.tax);
    const rounds = [round1, round2, round3];
    
    const currentIndex = rounds.indexOf(group.currentRound);
    if (currentIndex >= rounds.length - 1) {
      return res.status(400).json({ error: 'Already at final round' });
    }

    const nextRound = rounds[currentIndex + 1];
    
    // Determine target tender
    let newTenderId;
    if (stayInSameTender) {
      // Stay in current tender
      newTenderId = group.tenderId;
    } else if (targetTenderId) {
      newTenderId = parseInt(targetTenderId);
    } else {
      // Use provided tender number
      if (!newTenderNumber) return res.status(400).json({ error: 'newTenderNumber is required when creating a new tender' });
      
      // Create new tender
      const newTender = await prisma.tender.create({
        data: {
          tenderNumber: newTenderNumber,
          title: group.tender.title,
          location: group.tender.location,
          exchangeRate: group.tender.exchangeRate,
          date: group.tender.date,
          responsibleBody: group.tender.responsibleBody,
          tenderType: 'AUCTION',
          status: 'OPEN',
          createdBy: req.userId
        }
      });
      newTenderId = newTender.id;
    }

    // Calculate new base price for next round
    let newBasePrice = 0;
    for (const item of group.items) {
      // Each item must have its own exchange rate
      const itemExchangeRate = item.exchangeRate;
      if (!itemExchangeRate) {
        return res.status(400).json({ error: `Item "${item.name}" is missing exchange rate. Cannot proceed to next round.` });
      }
      const unitPrice = calcUnitPrice(item.cif, item.fob, item.tax, nextRound, itemExchangeRate);
      const totalPrice = unitPrice * item.totalQuantity;
      newBasePrice += totalPrice;
    }

    // Create new group in new tender
    const newGroup = await prisma.group.create({
      data: {
        tenderId: newTenderId,
        code: newGroupCode || group.code,
        name: group.name,
        title: group.title,
        vehiclePlate: group.vehiclePlate,
        date: group.date,
        location: group.location,
        responsibleBody: group.responsibleBody,
        exchangeRate: group.exchangeRate,
        originalGroupId: groupId,
        basePrice: newBasePrice,
        currentRound: nextRound,
        roundNumber: group.roundNumber + 1,
        status: 'OPEN'
      }
    });

    // Copy items to new group with updated prices
    for (const item of group.items) {
      // Each item must have its own exchange rate
      const itemExchangeRate = item.exchangeRate;
      if (!itemExchangeRate) {
        return res.status(400).json({ error: `Item "${item.name}" is missing exchange rate. Cannot proceed to next round.` });
      }
      const unitPrice = calcUnitPrice(item.cif, item.fob, item.tax, nextRound, itemExchangeRate);
      const totalPrice = unitPrice * item.totalQuantity;
      
      await prisma.item.create({
        data: {
          groupId: newGroup.id,
          itemCode: item.itemCode,
          serialNumber: item.serialNumber,
          name: item.name,
          itemType: item.itemType,
          brand: item.brand,
          country: item.country,
          unit: item.unit,
          warehouse1: item.warehouse1,
          warehouse2: item.warehouse2,
          warehouse3: item.warehouse3,
          totalQuantity: item.totalQuantity,
          fob: item.fob,
          cif: item.cif,
          tax: item.tax,
          exchangeRate: itemExchangeRate,
          expireDate: item.expireDate,
          unitPrice,
          totalPrice
        }
      });
    }

    // Mark original group as moved to next round
    await prisma.group.update({
      where: { id: groupId },
      data: { status: 'CLOSED' }
    });

    // Ensure new group is OPEN
    await prisma.group.update({
      where: { id: newGroup.id },
      data: { status: 'OPEN' }
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
          newTenderId,
          newGroupId: newGroup.id,
          newBasePrice,
          stayInSameTender 
        }), 
        ipAddress: req.ip 
      } 
    });

    res.json({ 
      message: stayInSameTender 
        ? `Moved to ${nextRound} in same tender` 
        : `Moved to ${nextRound} in new tender`, 
      newGroup, 
      newTenderId,
      newBasePrice 
    });
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

// Split group by selecting specific items
router.post('/:id/split-by-items', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { itemIds, newGroupCode, newGroupTitle } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'itemIds array is required and must not be empty' });
    }
    if (!newGroupCode) {
      return res.status(400).json({ error: 'newGroupCode is required' });
    }

    const originalGroup = await prisma.group.findUnique({ 
      where: { id: groupId }, 
      include: { items: true, tender: true } 
    });
    
    if (!originalGroup) {
      return res.status(404).json({ error: 'Group not found' });
    }
    if (originalGroup.status !== 'OPEN') {
      return res.status(400).json({ error: 'Only open groups can be split' });
    }

    // Verify all itemIds belong to this group
    const selectedItems = originalGroup.items.filter(item => itemIds.includes(item.id));
    if (selectedItems.length !== itemIds.length) {
      return res.status(400).json({ error: 'Some items do not belong to this group' });
    }
    if (selectedItems.length === originalGroup.items.length) {
      return res.status(400).json({ error: 'Cannot move all items. At least one item must remain in the original group' });
    }

    // Create new group with same properties
    const newGroup = await prisma.group.create({
      data: {
        tenderId: originalGroup.tenderId,
        code: newGroupCode,
        name: `${originalGroup.code} : Split`,
        title: newGroupTitle || null,
        date: originalGroup.date,
        location: originalGroup.location,
        responsibleBody: originalGroup.responsibleBody,
        exchangeRate: originalGroup.exchangeRate,
        vehiclePlate: originalGroup.vehiclePlate,
        currentRound: originalGroup.currentRound,
        roundNumber: originalGroup.roundNumber,
        status: 'OPEN',
        basePrice: 0
      }
    });

    // Move selected items to new group
    await prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { groupId: newGroup.id }
    });

    // Recalculate base prices for both groups
    const newGroupItems = await prisma.item.findMany({ where: { groupId: newGroup.id } });
    const newGroupBasePrice = newGroupItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    await prisma.group.update({ 
      where: { id: newGroup.id }, 
      data: { basePrice: newGroupBasePrice } 
    });

    const remainingItems = await prisma.item.findMany({ where: { groupId: groupId } });
    const originalGroupBasePrice = remainingItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    await prisma.group.update({ 
      where: { id: groupId }, 
      data: { basePrice: originalGroupBasePrice } 
    });

    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'SPLIT_GROUP_BY_ITEMS', 
        entity: 'Group', 
        entityId: groupId, 
        details: JSON.stringify({ 
          newGroupId: newGroup.id,
          newGroupCode,
          itemsMoved: itemIds.length,
          itemsRemaining: remainingItems.length
        }), 
        ipAddress: req.ip 
      } 
    });

    res.status(201).json({ 
      message: 'Group split successfully', 
      originalGroup: { 
        id: groupId, 
        code: originalGroup.code, 
        itemsRemaining: remainingItems.length,
        basePrice: originalGroupBasePrice
      }, 
      newGroup: {
        id: newGroup.id,
        code: newGroup.code,
        name: newGroup.name,
        itemsMoved: selectedItems.length,
        basePrice: newGroupBasePrice
      }
    });
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

    // Store previous round and base price before converting to HARAJ
    const previousRound = group.currentRound;
    const previousBasePrice = group.basePrice;

    // Determine the haraj price
    let finalPrice;
    
    if (harajPrice && parseFloat(harajPrice) > 0) {
      // User provided a custom haraj price
      finalPrice = parseFloat(harajPrice);
    } else if (previousBasePrice && previousBasePrice > 0) {
      // Use existing base price
      finalPrice = previousBasePrice;
    } else {
      // Calculate from lowest of CIF, FOB, TAX for each item
      let calculatedPrice = 0;
      if (group.items.length > 0) {
        const exchangeRate = group.exchangeRate || group.tender.exchangeRate || 1;
        for (const item of group.items) {
          const lowestPrice = Math.min(
            item.cif || Infinity, 
            item.fob || Infinity, 
            item.tax || Infinity
          );
          if (lowestPrice !== Infinity && lowestPrice > 0) {
            const unitPrice = lowestPrice * exchangeRate;
            const totalPrice = unitPrice * item.totalQuantity;
            calculatedPrice += totalPrice;
          }
        }
      }
      finalPrice = calculatedPrice;
    }

    const round = parseInt(harajRound) || 1;

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        currentRound: 'HARAJ',
        harajPrice: finalPrice,
        basePrice: 0,
        roundNumber: round,
        previousRound: previousRound
      }
    });

    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'SEND_TO_HARAJ', 
        entity: 'Group', 
        entityId: groupId, 
        details: JSON.stringify({ 
          harajPrice: finalPrice, 
          harajRound: round, 
          previousRound,
          previousBasePrice,
          source: harajPrice ? 'user_input' : (previousBasePrice > 0 ? 'existing_base_price' : 'calculated')
        }), 
        ipAddress: req.ip 
      } 
    });
    
    res.json({ 
      message: 'Group converted to Haraj', 
      group: updatedGroup, 
      harajPrice: finalPrice,
      previousBasePrice 
    });
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

// Yasbela: winner cancels — apply 5% penalty, create new tender and group
router.post('/:id/yasbela', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const { yasbelaType, reason, yasbelaTenderId, newGroupCode } = req.body;

    const group = await prisma.group.findUnique({ 
      where: { id: groupId }, 
      include: { items: true, tender: true } 
    });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to apply Yasbela' });
    if (!group.winnerPrice) return res.status(400).json({ error: 'No winner price found' });

    const penalty = group.winnerPrice * 0.05;

    // Mark original group as YASBELA
    await prisma.group.update({
      where: { id: groupId },
      data: { 
        status: 'YASBELA', 
        yasbelaPenalty: penalty,
        yasbelaType: yasbelaType || 'NO_PAYMENT',
        yasbelaReason: reason || null, 
        yasbelaDate: new Date() 
      }
    });

    // Determine target tender
    let targetTenderId;
    if (yasbelaTenderId) {
      targetTenderId = parseInt(yasbelaTenderId);
    } else {
      // Auto-generate next tender number
      const currentTenderNumber = group.tender.tenderNumber;
      const match = currentTenderNumber.match(/(\d+)\/(\d+)/);
      
      let newTenderNumber;
      if (match) {
        const num = parseInt(match[1]);
        const year = match[2];
        newTenderNumber = `${String(num + 1).padStart(3, '0')}/${year}`;
      } else {
        newTenderNumber = `${currentTenderNumber}-YASBELA`;
      }
      
      // Create new tender
      const newTender = await prisma.tender.create({
        data: {
          tenderNumber: newTenderNumber,
          title: group.tender.title,
          location: group.tender.location,
          exchangeRate: group.tender.exchangeRate,
          date: group.tender.date,
          responsibleBody: group.tender.responsibleBody,
          tenderType: 'YASBELA',
          originalTenderId: group.tenderId,
          status: 'OPEN',
          createdBy: req.userId
        }
      });
      targetTenderId = newTender.id;
    }

    const targetTender = await prisma.tender.findUnique({ where: { id: targetTenderId } });
    if (!targetTender) return res.status(404).json({ error: 'Target tender not found' });

    // Determine initial round based on tender type
    let initialRound = group.currentRound;
    if (targetTender.tenderType === 'HARAJ') {
      initialRound = 'HARAJ';
    } else if (targetTender.tenderType === 'AUCTION' || targetTender.tenderType === 'YASBELA') {
      if (group.items.length > 0) {
        const fi = group.items[0];
        const prices = [
          { name: 'CIF', value: fi.cif }, 
          { name: 'FOB', value: fi.fob }, 
          { name: 'TAX', value: fi.tax }
        ];
        prices.sort((a, b) => b.value - a.value);
        initialRound = prices[0].name;
      }
    }

    // Create new group in target tender
    const newGroup = await prisma.group.create({
      data: {
        tenderId: targetTenderId,
        code: newGroupCode || group.code,
        name: group.name,
        title: group.title,
        vehiclePlate: group.vehiclePlate,
        date: group.date,
        location: group.location,
        responsibleBody: group.responsibleBody,
        exchangeRate: group.exchangeRate,
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
          itemCode: item.itemCode, 
          serialNumber: item.serialNumber, 
          name: item.name,
          itemType: item.itemType, 
          brand: item.brand, 
          country: item.country, 
          unit: item.unit,
          warehouse1: item.warehouse1, 
          warehouse2: item.warehouse2, 
          warehouse3: item.warehouse3,
          totalQuantity: item.totalQuantity, 
          fob: item.fob, 
          cif: item.cif, 
          tax: item.tax,
          exchangeRate: item.exchangeRate,
          expireDate: item.expireDate,
          unitPrice: item.unitPrice, 
          totalPrice: item.totalPrice
        }
      });
    }

    await prisma.auditLog.create({ 
      data: { 
        userId: req.userId, 
        action: 'YASBELA', 
        entity: 'Group', 
        entityId: groupId, 
        details: JSON.stringify({ 
          penalty,
          yasbelaType,
          reason, 
          newGroupId: newGroup.id, 
          targetTenderId 
        }), 
        ipAddress: req.ip 
      } 
    });
    
    res.json({ 
      message: 'Yasbela applied - group moved to new tender', 
      penalty, 
      newGroup,
      newTenderId: targetTenderId
    });
  } catch (error) { next(error); }
});

// Delete group
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id);
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Delete all related data (cascade delete)
    await prisma.bid.deleteMany({ where: { groupId } });
    await prisma.bidderGroup.deleteMany({ where: { groupId } });
    await prisma.item.deleteMany({ where: { groupId } });
    await prisma.group.delete({ where: { id: groupId } });
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
