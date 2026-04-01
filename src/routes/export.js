const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType, TabStopPosition } = require('docx');
const prisma = require('../prisma');

const fmt = (n) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

// Shared styles
const bold = { font: { bold: true, name: 'Nyala', size: 11 } };
const center = { alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } };
const borderStyle = { border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };
const headerFill = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } } };
const winnerFill = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } };
const yellowFill = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } } };
const hStyle = { ...bold, ...center, ...borderStyle, ...headerFill };

function applyStyle(cell, ...styles) {
  styles.forEach(s => Object.assign(cell, s));
}

function setCell(sheet, r, c, v, ...styles) {
  const cl = sheet.getCell(r, c);
  cl.value = v;
  styles.forEach(s => Object.assign(cl, s));
  return cl;
}

// Build the official auction sheet for one group
function buildGroupSheet(sheet, group, tender) {
  console.log(`[Export] Building sheet for group ${group.code}, items: ${group.items?.length || 0}`);
  
  const round = group.currentRound;
  const exRate = group.exchangeRate || tender.exchangeRate;

  const HEADERS = [
    'ተ.ቁ', 'የእቃው አይነት', 'ማርክ', 'ስሪት\n ሀገር', 'መለኪያ',
    'መጋዘን1', 'መጋዘን 2', 'መጋዝን\n3', 'ጠቅላላ ድምር',
    `መነሻ ዋጋ\n(${round})`, 'ጠቅላላ \nዋጋ', 'ሞዴል',
    'ተጨራጩ የሰጠው ዋጋ', 'የተጨራቹ ስም',
    'የአንድ ዋጋ\n(FOB)', 'የአንድ ዋጋ\n(CIF)', 'የአንድ ዋጋ\n(TAX)', 'exchange rate'
  ];

  // Row 1: title
  sheet.mergeCells('A1:E1');
  setCell(sheet, 1, 1, `ግልፅ ጨረታ ቁጥር ${tender.tenderNumber}`, { font: { bold: true, size: 13, name: 'Nyala' } });
  sheet.mergeCells('F1:K1');
  setCell(sheet, 1, 6, tender.title || group.name || '', { font: { bold: true, size: 13, name: 'Nyala' }, ...center });

  // Row 2: column headers
  HEADERS.forEach((h, i) => setCell(sheet, 2, i + 1, h, hStyle));
  sheet.getRow(2).height = 36;

  // Current round bids only, sorted desc
  const roundBids = (group.bids || [])
    .filter(b => b.round === round)
    .sort((a, b) => b.bidPrice - a.bidPrice);
  const winner = roundBids.find(b => b.isWinner) || roundBids[0] || null;
  
  console.log(`[Export] Group ${group.code}: ${group.bids?.length || 0} total bids, ${roundBids.length} for round ${round}`);

  let r = 3;
  let itemNumber = 1;
  
  for (const item of group.items) {
    const unitPriceMap = {
      FOB: item.fob * exRate,
      CIF: item.cif * exRate,
      TAX: item.tax * exRate,
      HARAJ: item.unitPrice || 0
    };
    const unitPrice = unitPriceMap[round] || item.unitPrice || 0;
    const totalPrice = unitPrice * item.totalQuantity;
    
    const itemIndex = itemNumber - 1;
    const bidder = roundBids[itemIndex] || null;

    const rowData = [
      itemNumber++, item.name, item.brand || '', item.country || '', item.unit,
      item.warehouse1 || 0, item.warehouse2 || 0, item.warehouse3 || 0, item.totalQuantity,
      unitPrice, totalPrice, item.itemCode || item.serialNumber || '',
      bidder ? bidder.bidPrice : '', bidder ? bidder.bidder.name : '',
      itemIndex === 0 ? item.fob : '', itemIndex === 0 ? item.cif : '', itemIndex === 0 ? item.tax : '', itemIndex === 0 ? exRate : ''
    ];

    rowData.forEach((v, i) => {
      // Skip rendering empty cells for FOB, CIF, TAX, Exchange Rate columns (indices 14-17)
      if (itemIndex > 0 && i >= 14 && i <= 17) {
        return; // Don't create/style these cells
      }
      
      const cl = sheet.getCell(r, i + 1);
      cl.value = v;
      Object.assign(cl, borderStyle);
      if (typeof v === 'number' && v !== 0) {
        // Remove decimals for whole numbers
        if (Number.isInteger(v)) {
          cl.numFmt = '#,##0';
        } else {
          cl.numFmt = '#,##0.00';
        }
      }
      
      // Highlight winner bid - yellow for name, green for price
      if (bidder && bidder.isWinner) {
        if (i === 13) { // Bidder name column
          applyStyle(cl, yellowFill, bold);
        } else if (i === 12) { // Bid price column
          applyStyle(cl, winnerFill, bold);
        }
      }
    });
    r++;
  }

  // Base price summary row
  sheet.mergeCells(`A${r}:J${r}`);
  setCell(sheet, r, 1, 'መነሻ ዋጋ', bold, borderStyle);
  const bp = sheet.getCell(r, 11);
  bp.value = group.basePrice || 0;
  bp.numFmt = Number.isInteger(group.basePrice) ? '#,##0' : '#,##0.00';
  applyStyle(bp, bold, borderStyle);
  r++;

  // Bids label
  sheet.mergeCells(`A${r}:N${r}`);
  setCell(sheet, r, 1, 'ከቫት በፊት ተጫራች የሚሰጠው  ጠቅላላ ዋጋ', bold, borderStyle);
  r++;

  // If there are more bidders than items, add extra rows for remaining bidders
  const remainingBidders = roundBids.slice(group.items.length);
  for (const bid of remainingBidders) {
    // Bid price in column M (13)
    const bc = sheet.getCell(r, 13);
    bc.value = bid.bidPrice;
    bc.numFmt = Number.isInteger(bid.bidPrice) ? '#,##0' : '#,##0.00';
    applyStyle(bc, borderStyle);

    // Bidder name in column N (14)
    const nc = sheet.getCell(r, 14);
    nc.value = bid.bidder.name;
    applyStyle(nc, borderStyle);

    // Highlight winner - yellow for name, green for price
    if (bid.isWinner) {
      applyStyle(bc, winnerFill, bold);
      applyStyle(nc, yellowFill, bold);
    }
    r++;
  }

  // Column widths
  [8, 28, 12, 10, 10, 10, 10, 10, 12, 16, 16, 12, 12, 12, 12, 12, 18, 22]
    .forEach((w, i) => { sheet.getColumn(i + 1).width = w; });

  sheet.views = [{ state: 'frozen', ySplit: 2 }];
}

// ── Export single group ────────────────────────────────────────────────────────
router.get('/excel/group/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    console.log(`[Export] Fetching group ${groupId} for Excel export`);
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true, items: true, bids: { include: { bidder: true }, orderBy: { bidPrice: 'desc' } } }
    });
    
    if (!group) {
      console.log(`[Export] Group ${groupId} not found`);
      return res.status(404).json({ error: 'Group not found' });
    }
    
    console.log(`[Export] Group ${group.code} found with ${group.items?.length || 0} items, ${group.bids?.length || 0} bids`);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ጨረታ');
    
    console.log(`[Export] Building sheet...`);
    buildGroupSheet(sheet, group, group.tender);
    console.log(`[Export] Sheet built successfully`);
    
    // Write to buffer first to check if it's empty
    const buffer = await workbook.xlsx.writeBuffer();
    console.log(`[Export] Buffer size: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      console.error(`[Export] Generated empty Excel file!`);
      return res.status(500).json({ error: 'Generated empty Excel file' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const safeCode = group.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safeCode}_${group.currentRound}.xlsx"`);
    res.send(buffer);
    
    console.log(`[Export] Excel file sent successfully`);

    if (req.userId) {
      prisma.auditLog.create({
        data: { userId: req.userId, action: 'EXPORT_GROUP_BIDS', entity: 'Group', entityId: groupId, details: JSON.stringify({ groupCode: group.code, round: group.currentRound }), ipAddress: req.ip }
      }).catch(() => {});
    }
  } catch (error) { 
    console.error(`[Export] Error exporting group:`, error);
    console.error(`[Export] Error stack:`, error.stack);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to generate Excel file' });
    }
  }
});

// ── Export full tender (ALL groups in ONE sheet) ───────────────────────────────
router.get('/excel/:tenderId', async (req, res, next) => {
  try {
    const tenderId = parseInt(req.params.tenderId);
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        groups: {
          include: { items: true, bids: { include: { bidder: true }, orderBy: { bidPrice: 'desc' } } },
          orderBy: { code: 'asc' }
        }
      }
    });
    if (!tender) return res.status(404).json({ error: 'Tender not found' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ጨረታ');
    const exRate = tender.exchangeRate;

    // Row 1: Header info (matching image)
    sheet.mergeCells('A1:B1');
    setCell(sheet, 1, 1, 'የተካሄደ ቁጥር፡', bold);
    sheet.mergeCells('C1:D1');
    setCell(sheet, 1, 3, tender.date ? new Date(tender.date).toLocaleDateString('en-GB') : '5/4/2017- 18/04/2017');
    
    sheet.mergeCells('E1:F1');
    setCell(sheet, 1, 5, 'የተካሄደ ቦታ፡');
    sheet.mergeCells('G1:H1');
    setCell(sheet, 1, 7, tender.location || '');
    
    sheet.mergeCells('I1:J1');
    setCell(sheet, 1, 9, 'ዓይነት');
    sheet.mergeCells('K1:L1');
    setCell(sheet, 1, 11, 'ስነዳ');
    
    sheet.mergeCells('M1:N1');
    setCell(sheet, 1, 13, 'የተጨማሪ ስልት');

    // Row 2: Title
    sheet.mergeCells('A2:N2');
    setCell(sheet, 2, 1, 'ግልፅ ወይም ሚስጥር 01/2018 የተለያዩ የሞባይል ቀፎዎች ለመግዛት የተዘጋጀ', { font: { bold: true, size: 11, name: 'Nyala' }, ...center });

    // Row 3: Column headers (13 columns + 1 for group code)
    const HEADERS = [
      'ተ.ቁ',
      'የእቃው አይነት',
      'ማርክ',
      'ስሪት\nሀገር',
      'መለኪያ',
      'መጋዘን1',
      'መጋዘን 2',
      'መጋዝን\n3',
      'ጠቅላላ\nድምር',
      'የአንድ ዋጋ (CIF)',
      'ጠቅላላ\nዋጋ',
      'ሞዴል',
      'ዋጋ',
      'ዋጋ'
    ];
    HEADERS.forEach((h, i) => setCell(sheet, 3, i + 1, h, hStyle));
    sheet.getRow(3).height = 36;

    let r = 4;
    let globalItemNumber = 1;

    for (const group of tender.groups) {
      const round = group.currentRound;
      const groupStartRow = r;
      
      for (let i = 0; i < group.items.length; i++) {
        const item = group.items[i];
        const unitPriceMap = {
          FOB: item.fob * exRate,
          CIF: item.cif * exRate,
          TAX: item.tax * exRate,
          HARAJ: item.unitPrice || 0
        };
        const unitPrice = unitPriceMap[round] || item.unitPrice || 0;
        const totalPrice = unitPrice * item.totalQuantity;

        const rowData = [
          globalItemNumber++,
          item.name,
          item.brand || '',
          item.country || '',
          item.unit,
          item.warehouse1 || 0,
          item.warehouse2 || 0,
          item.warehouse3 || 0,
          item.totalQuantity,
          unitPrice,
          totalPrice,
          item.itemCode || item.serialNumber || '',
          '', // Empty for now
          '' // Group code will be merged
        ];

        rowData.forEach((v, colIdx) => {
          const cl = sheet.getCell(r, colIdx + 1);
          cl.value = v;
          Object.assign(cl, borderStyle);
          if (typeof v === 'number' && v !== 0) {
            cl.numFmt = Number.isInteger(v) ? '#,##0' : '#,##0.00';
          }
        });
        r++;
      }

      // Merge group code cell on the right (column N)
      if (group.items.length > 0) {
        sheet.mergeCells(`N${groupStartRow}:N${r - 1}`);
        const groupCell = sheet.getCell(`N${groupStartRow}`);
        groupCell.value = group.code;
        Object.assign(groupCell, { ...bold, ...center, ...borderStyle });
      }

      // Base price row
      sheet.mergeCells(`A${r}:J${r}`);
      setCell(sheet, r, 1, 'መነሻ ዋጋ', bold, borderStyle, center);
      const bp = sheet.getCell(r, 11);
      bp.value = group.basePrice || 0;
      bp.numFmt = Number.isInteger(group.basePrice) ? '#,##0' : '#,##0.00';
      applyStyle(bp, bold, borderStyle);
      r++;
    }

    // Final summary row
    sheet.mergeCells(`A${r}:J${r}`);
    setCell(sheet, r, 1, 'ከቫት በፊት ተጫራች የሚሰጠው  ጠቅላላ ዋጋ', bold, borderStyle);
    r++;

    // Column widths
    [6, 30, 12, 10, 10, 10, 10, 10, 12, 16, 16, 15, 12, 15]
      .forEach((w, i) => { sheet.getColumn(i + 1).width = w; });

    sheet.views = [{ state: 'frozen', ySplit: 3 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const safeTN = tender.tenderNumber.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="tender_${safeTN}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

    await prisma.auditLog.create({
      data: { userId: req.userId, action: 'EXPORT_EXCEL', entity: 'Tender', entityId: tenderId, details: JSON.stringify({ tenderNumber: tender.tenderNumber }), ipAddress: req.ip }
    });
  } catch (error) { next(error); }
});

// ── Export tender to PDF ───────────────────────────────────────────────────────
router.get('/pdf/:tenderId', async (req, res, next) => {
  let browser;
  try {
    const tenderId = parseInt(req.params.tenderId);
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        groups: {
          include: { items: true, bids: { include: { bidder: true }, orderBy: { bidPrice: 'desc' } } },
          orderBy: { code: 'asc' }
        }
      }
    });
    if (!tender) return res.status(404).json({ error: 'Tender not found' });

    let groupsHtml = '';
    for (const group of tender.groups) {
      const round = group.currentRound;
      const exRate = tender.exchangeRate;
      const roundBids = group.bids.filter(b => b.round === round).sort((a, b) => b.bidPrice - a.bidPrice);
      const winner = roundBids.find(b => b.isWinner) || roundBids[0] || null;

      let itemRows = '';
      let itemNum = 1;
      for (const item of group.items) {
        const unitPriceMap = { FOB: item.fob * exRate, CIF: item.cif * exRate, TAX: item.tax * exRate, HARAJ: item.unitPrice || 0 };
        const unitPrice = unitPriceMap[round] || item.unitPrice || 0;
        const totalPrice = unitPrice * item.totalQuantity;
        itemRows += `<tr>
          <td>${itemNum++}</td><td>${item.name}</td><td>${item.brand||''}</td><td>${item.country||''}</td>
          <td>${item.unit}</td><td>${item.warehouse1||0}</td><td>${item.warehouse2||0}</td><td>${item.warehouse3||0}</td>
          <td>${item.totalQuantity}</td><td>${fmt(unitPrice)}</td><td>${fmt(totalPrice)}</td>
          <td>${item.itemCode||item.serialNumber||''}</td><td></td><td></td>
          <td></td><td></td><td></td><td></td><td></td>
        </tr>`;
      }

      let bidRows = roundBids.map(bid => `
        <tr class="${bid.isWinner ? 'winner' : ''}">
          <td colspan="12"></td>
          <td>${fmt(bid.bidPrice)}</td><td>${bid.bidder.name}</td>
        </tr>`).join('');

      groupsHtml += `
        <div class="group-section">
          <div class="group-title">ግልፅ ጨረታ ቁጥር ${tender.tenderNumber} &nbsp;&nbsp; ${tender.title || group.name || ''}</div>
          <table>
            <thead><tr>
              <th>ተ.ቁ</th><th>የእቃው አይነት</th><th>ማርክ</th><th>ስሪት ሀገር</th><th>መለኪያ</th>
              <th>መጋዘን1</th><th>መጋዘን2</th><th>መጋዘን3</th><th>ጠቅላላ ድምር</th>
              <th>መነሻ ዋጋ</th><th>ጠቅላላ ዋጋ</th><th>ሞዴል</th>
              <th>ተጨራጩ የሰጠው ዋጋ</th><th>የተጨራቹ ስም</th><th>ኮድ</th>
              <th>FOB</th><th>CIF</th><th>TAX</th><th>Rate</th>
            </tr></thead>
            <tbody>
              ${itemRows}
              <tr class="summary-row"><td colspan="9"><b>መነሻ ዋጋ</b></td><td></td><td><b>${fmt(group.basePrice)}</b></td><td colspan="8"></td></tr>
              <tr class="bids-label"><td colspan="13"><b>ከቫት በፊት ተጫራች የሚሰጠው ጠቅላላ ዋጋ</b></td><td colspan="6"></td></tr>
              ${bidRows}
            </tbody>
          </table>
        </div>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        body { font-family: 'Nyala', 'Segoe UI', sans-serif; font-size: 9px; margin: 10px; }
        .group-section { margin-bottom: 20px; page-break-after: always; }
        .group-title { font-weight: bold; font-size: 12px; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 3px 4px; white-space: nowrap; }
        th { background: #D9E1F2; font-weight: bold; text-align: center; }
        .winner { background: #C6EFCE; font-weight: bold; }
        .summary-row td { background: #f5f5f5; }
        .bids-label td { background: #fffbe6; font-weight: bold; }
      </style></head><body>${groupsHtml}</body></html>`;

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A3', landscape: true, printBackground: true, margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tender_${tender.tenderNumber}.pdf"`);
    res.send(pdfBuffer);

    await prisma.auditLog.create({
      data: { userId: req.userId, action: 'EXPORT_PDF', entity: 'Tender', entityId: tenderId, details: JSON.stringify({ tenderNumber: tender.tenderNumber }), ipAddress: req.ip }
    });
  } catch (error) { next(error); }
  finally { if (browser) await browser.close(); }
});

// ── Export closed group with calculations (70%, 30%, VAT) ────────────────────
router.get('/excel/group/:groupId/closed', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { tender: true, items: true, bids: { include: { bidder: true }, orderBy: { bidPrice: 'desc' } } }
    });
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to generate closed report' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ጨረታ');
    const tender = group.tender;
    const round = group.currentRound;
    const exRate = group.exchangeRate || tender.exchangeRate;

    // Winner bid
    const roundBids = group.bids.filter(b => b.round === round).sort((a, b) => b.bidPrice - a.bidPrice);
    const winner = roundBids.find(b => b.isWinner) || roundBids[0] || null;

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER SECTION
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Row 1: Main Title (merged across full width)
    sheet.mergeCells('A1:T1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `ግልፅ ጨረታ ቁጥር ${tender.tenderNumber} ${tender.title || group.name || 'የተለያዩ አልባሰት'}`;
    titleCell.font = { name: 'Arial', size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
    sheet.getRow(1).height = 30;

    // ═══════════════════════════════════════════════════════════════════════════
    // TABLE HEADERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    const headerStyle = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Row 2: Column Headers
    const headers = [
      'ተ.ቁ',                    // A2
      'የእቃው አይነት',             // B2
      'ማርክ',                    // C2
      'ስሪት ሀገር',               // D2
      'መለኪያ',                  // E2
      'መጋዘን 1',                // F2
      'መጋዘን 2',                // G2
      'መጋዘን 3',                // H2
      'መጋዘን 3ሀ',               // I2
      'ጠቅላላ ድምር',             // J2
      'የአንድ ዋጋ (TAX)',         // K2
      'ጠቅላላ ዋጋ',              // L2
      'ሞዴል',                   // M2
      'ተጨራጩ የሰጠው ዋጋ',        // N2
      'የተጨራቹ ስም',             // O2
      'ኮድ',                    // P2
      'FOB',                   // Q2
      'CIF',                   // R2
      'TAX',                   // S2
      'exchange rate'          // T2
    ];

    headers.forEach((header, index) => {
      const cell = sheet.getCell(2, index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    
    sheet.getRow(2).height = 40;

    // Merge columns for winner info and exchange rate
    const totalItems = group.items.length;
    if (totalItems > 0) {
      const lastItemRow = 2 + totalItems;
      sheet.mergeCells(`N3:N${lastItemRow}`);
      sheet.mergeCells(`O3:O${lastItemRow}`);
      sheet.mergeCells(`P3:P${lastItemRow}`);
      sheet.mergeCells(`T3:T${lastItemRow}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA ROWS
    // ═══════════════════════════════════════════════════════════════════════════
    
    const dataBorder = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    let currentRow = 3;
    let totalBasePrice = 0;

    group.items.forEach((item, index) => {
      // Calculate unit price based on current round
      const unitPriceMap = {
        FOB: item.fob * exRate,
        CIF: item.cif * exRate,
        TAX: item.tax * exRate,
        HARAJ: item.unitPrice || 0
      };
      const unitPrice = unitPriceMap[round] || item.unitPrice || 0;
      const totalPrice = unitPrice * item.totalQuantity;
      totalBasePrice += totalPrice;

      const rowData = [
        index + 1,
        item.name,
        item.brand || '',
        item.country || '',
        item.unit,
        item.warehouse1 || 0,
        item.warehouse2 || 0,
        item.warehouse3 || 0,
        0,
        item.totalQuantity,
        unitPrice,
        totalPrice,
        item.itemCode || item.serialNumber || '',
        index === 0 && winner ? winner.bidPrice : '',
        index === 0 && winner ? winner.bidder.name : '',
        index === 0 ? group.code : '',
        index === 0 ? item.fob : '',
        index === 0 ? item.cif : '',
        index === 0 ? item.tax : '',
        index === 0 ? exRate : ''
      ];

      rowData.forEach((value, colIndex) => {
        const cell = sheet.getCell(currentRow, colIndex + 1);
        
        if ((colIndex === 13 || colIndex === 14 || colIndex === 15 || colIndex === 19) && index > 0) {
          // Skip merged cells
        } else {
          cell.value = value;
        }
        
        cell.border = dataBorder;
        cell.font = { name: 'Arial', size: 10 };

        if (typeof value === 'number' && value !== 0) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = Number.isInteger(value) ? '#,##0' : '#,##0.00';
        } else {
          if (colIndex === 13 || colIndex === 14 || colIndex === 15 || colIndex === 19) {
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        }
      });

      sheet.getRow(currentRow).height = 20;
      currentRow++;
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // SUMMARY SECTION
    // ═══════════════════════════════════════════════════════════════════════════
    
    const winnerPrice = winner ? winner.bidPrice : 0;
    const calc70 = winnerPrice * 0.70;
    const calc30 = winnerPrice * 0.30;
    const vat = winnerPrice * 0.15;
    const finalTotal = winnerPrice + vat;

    const summaryStyle = {
      font: { name: 'Arial', size: 11, bold: true },
      border: dataBorder,
      alignment: { horizontal: 'right', vertical: 'middle' }
    };

    const summaryValueStyle = {
      font: { name: 'Arial', size: 11, bold: true },
      border: dataBorder,
      alignment: { horizontal: 'right', vertical: 'middle' },
      numFmt: '#,##0'
    };

    // Empty row for spacing
    currentRow++;

    // Base price row
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const basePriceLabel = sheet.getCell(`A${currentRow}`);
    basePriceLabel.value = 'የእቃው መነሻ ዋጋ ከቫት በፊት';
    Object.assign(basePriceLabel, summaryStyle);
    
    const basePriceValue = sheet.getCell(`L${currentRow}`);
    basePriceValue.value = totalBasePrice;
    Object.assign(basePriceValue, summaryValueStyle);
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // 70% row
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const label70 = sheet.getCell(`A${currentRow}`);
    label70.value = '70%';
    Object.assign(label70, summaryStyle);
    
    const value70 = sheet.getCell(`L${currentRow}`);
    value70.value = calc70;
    Object.assign(value70, summaryValueStyle);
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // 30% row
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const label30 = sheet.getCell(`A${currentRow}`);
    label30.value = '30%';
    Object.assign(label30, summaryStyle);
    
    const value30 = sheet.getCell(`L${currentRow}`);
    value30.value = calc30;
    Object.assign(value30, summaryValueStyle);
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // VAT row (highlighted)
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const labelVAT = sheet.getCell(`A${currentRow}`);
    labelVAT.value = '15% (ቫት)';
    Object.assign(labelVAT, summaryStyle);
    
    const valueVAT = sheet.getCell(`L${currentRow}`);
    valueVAT.value = vat;
    Object.assign(valueVAT, summaryValueStyle);
    valueVAT.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Yellow
    sheet.getRow(currentRow).height = 25;
    currentRow++;

    // Final total row (highlighted green)
    sheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const labelTotal = sheet.getCell(`A${currentRow}`);
    labelTotal.value = 'ጠቅላላ የእቃው ክፍያ ድምር';
    Object.assign(labelTotal, summaryStyle);
    
    const valueTotal = sheet.getCell(`L${currentRow}`);
    valueTotal.value = finalTotal;
    Object.assign(valueTotal, summaryValueStyle);
    valueTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }; // Green
    sheet.getRow(currentRow).height = 25;

    // ═══════════════════════════════════════════════════════════════════════════
    // COLUMN WIDTHS
    // ═══════════════════════════════════════════════════════════════════════════
    
    const columnWidths = [
      8, 30, 12, 12, 10, 10, 10, 10, 10, 12, 15, 16, 15, 18, 20, 12, 12, 12, 12, 15
    ];

    columnWidths.forEach((width, index) => {
      sheet.getColumn(index + 1).width = width;
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PRINT SETUP
    // ═══════════════════════════════════════════════════════════════════════════
    
    sheet.pageSetup = {
      paperSize: 9,              // A4
      orientation: 'landscape',  // Landscape
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,            // Allow multiple pages vertically if needed
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      },
      printArea: `A1:T${currentRow}`,
      horizontalCentered: true
    };

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 2 }];

    // ═══════════════════════════════════════════════════════════════════════════
    // SEND FILE
    // ═══════════════════════════════════════════════════════════════════════════
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const safeAuctionNumber = tender.tenderNumber.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Auction_${safeAuctionNumber}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

    if (req.userId) {
      prisma.auditLog.create({
        data: { 
          userId: req.userId, 
          action: 'EXPORT_CLOSED_GROUP', 
          entity: 'Group', 
          entityId: groupId, 
          details: JSON.stringify({ 
            groupCode: group.code, 
            winnerName: winner?.bidder.name, 
            winnerPrice,
            auctionNumber: tender.tenderNumber 
          }), 
          ipAddress: req.ip 
        }
      }).catch(() => {});
    }
  } catch (error) { next(error); }
});

// ── Generate Customizable Winner Letter (የመሸኛ ደብደዳቤ) ────────────────────────
router.get('/winner-letter/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { 
        tender: true, 
        items: true, 
        bids: { 
          where: { isWinner: true },
          include: { bidder: true } 
        } 
      }
    });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to generate winner letter' });
    if (!group.bids || group.bids.length === 0) return res.status(400).json({ error: 'No winner found' });

    const winner = group.bids[0];
    const winnerPrice = winner.bidPrice;
    const calc70 = winnerPrice * 0.70;
    const calc30 = winnerPrice * 0.30;
    const vat = winnerPrice * 0.15;
    const totalWithVAT = calc70 + calc30 + vat;

    // Ethiopian date conversion (simplified)
    const today = new Date();
    const ethiopianYear = today.getFullYear() - 7;
    const ethiopianDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${ethiopianYear}`;

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
          }
        },
        children: [
          // Reference Number
          new Paragraph({
            text: `ቁጥር/Ref.No: ${group.tender.tenderNumber}/${group.code}`,
            spacing: { after: 200 }
          }),
          
          // Date
          new Paragraph({
            text: `ቀን /Date: ${ethiopianDate}`,
            spacing: { after: 400 }
          }),
          
          // Recipient
          new Paragraph({
            text: 'ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን',
            spacing: { after: 200 }
          }),
          
          // Subject
          new Paragraph({
            children: [
              new TextRun({ text: 'ጉዳዩ፤ ', bold: true }),
              new TextRun({ text: 'ክፊያ መቀበለን ይመለከታል' })
            ],
            spacing: { after: 400 }
          }),
          
          // Body paragraph 1
          new Paragraph({
            text: `በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር ${group.tender.tenderNumber} በ${ethiopianDate} ዓ.ም የተካሄደ መሆኑ ይታወቃል። በዚህ መሠረት ስት ${winner.bidder.name} በኮድ-${group.code} የተለየዩ ${group.tender.title || 'የሞባይል ቀፎ'} በብር ${fmt(winnerPrice)} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።`,
            spacing: { after: 400 },
            alignment: AlignmentType.JUSTIFIED
          }),
          
          // Payment breakdown
          new Paragraph({
            children: [
              new TextRun({ text: '70% ', bold: true }),
              new TextRun({ text: '----------------------------------------------------' }),
              new TextRun({ text: ` ${fmt(calc70)}`, bold: true })
            ],
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: '30% ', bold: true }),
              new TextRun({ text: '----------------------------------------------------' }),
              new TextRun({ text: ` ${fmt(calc30)}`, bold: true })
            ],
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: '15% (ቫት) ', bold: true }),
              new TextRun({ text: '---------------------------------------------' }),
              new TextRun({ text: ` ${fmt(vat)}`, bold: true })
            ],
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({ text: 'ጠቅላላ ድምር ', bold: true }),
              new TextRun({ text: '-------------------------------------------' }),
              new TextRun({ text: ` ${fmt(totalWithVAT)}`, bold: true })
            ],
            spacing: { after: 400 }
          }),
          
          // Instructions paragraph
          new Paragraph({
            text: 'ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውት ቁጥር 1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ግልባጭ ተደርጎለታል፡፡',
            spacing: { after: 600 },
            alignment: AlignmentType.JUSTIFIED
          }),
          
          // Closing
          new Paragraph({
            text: '‹‹ከሰላምታ ጋር››',
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          
          // Copy distribution header
          new Paragraph({
            children: [
              new TextRun({ text: 'ግልባጭ፡-', bold: true, underline: {} })
            ],
            spacing: { after: 200 }
          }),
          
          // Copy distribution list
          new Paragraph({ text: 'ለጉምሩክ ኦፕሬሽን ም/ስ/አስኪያጅ', spacing: { after: 100 } }),
          new Paragraph({ text: 'የተያዙና የተወረሱ ንብ/አስ/የስራ ሂደት', spacing: { after: 100 } }),
          new Paragraph({ text: 'ለኢንተለጀንስ እና ኮተረበንድ ክትትል የስራ ሂደት', spacing: { after: 100 } }),
          new Paragraph({ text: 'ለእቃ አያያዝ ቡድን', spacing: { after: 100 } }),
          new Paragraph({ text: 'ለውርስ እቃ አስወጋጅ ኮሚቴ', spacing: { after: 100 } }),
          new Paragraph({ text: 'መጋዘን 1', spacing: { after: 100 } }),
          new Paragraph({ text: 'ለበር ጥበቃ', spacing: { after: 100 } }),
          new Paragraph({ text: 'ለድ/ለኮን/ቁጥ/ድን/ተሻ/ፖሊ/መምሪያ ሪጅመንት 14', spacing: { after: 100 } }),
          new Paragraph({ text: 'ድ/ዳ/ጉ/ኮምሽን', spacing: { after: 100 } }),
          new Paragraph({ text: `አቶ ${winner.bidder.name}`, spacing: { after: 100 } }),
          new Paragraph({ text: 'በ/መ', spacing: { after: 100 } })
        ]
      }]
    });

    // Generate and send document
    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const safeCode = group.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Winner_Letter_${safeCode}.docx"`);
    res.send(buffer);

    if (req.userId) {
      prisma.auditLog.create({
        data: { 
          userId: req.userId, 
          action: 'EXPORT_WINNER_LETTER', 
          entity: 'Group', 
          entityId: groupId, 
          details: JSON.stringify({ 
            groupCode: group.code, 
            winnerName: winner.bidder.name,
            winnerPrice 
          }), 
          ipAddress: req.ip 
        }
      }).catch(() => {});
    }
  } catch (error) { next(error); }
});

// ── Generate Winner Letter Excel (የመሸኛ ደብደዳቤ) - Legacy ────────────────────────
router.get('/winner-letter-excel/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { 
        tender: true, 
        items: true, 
        bids: { 
          where: { isWinner: true },
          include: { bidder: true } 
        } 
      }
    });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to generate winner letter' });
    if (!group.bids || group.bids.length === 0) return res.status(400).json({ error: 'No winner found' });

    const winner = group.bids[0];
    const winnerPrice = winner.bidPrice;
    const calc70 = winnerPrice * 0.70;
    const calc30 = winnerPrice * 0.30;
    const vat = winnerPrice * 0.15;
    const totalWithVAT = winnerPrice + vat;

    // Get current Ethiopian date (simplified - you may want to use a proper Ethiopian calendar library)
    const today = new Date();
    const ethiopianYear = today.getFullYear() - 7; // Approximate conversion
    const ethiopianDate = `${today.getDate()}/${today.getMonth() + 1}/${ethiopianYear}`;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('የመሸኛ ደብደዳቤ');

    // Set page setup for printing
    sheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'portrait',
      margins: { left: 1, right: 1, top: 1, bottom: 1 }
    };

    // Column widths
    sheet.getColumn(1).width = 15;
    sheet.getColumn(2).width = 50;

    let row = 1;

    // Header - Logo/Letterhead area (you can customize this)
    sheet.mergeCells(`A${row}:B${row}`);
    const headerCell = sheet.getCell(`A${row}`);
    headerCell.value = 'ድሬዳዋ ጉምሩክ ኮሚሽን';
    headerCell.font = { name: 'Nyala', size: 16, bold: true };
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(row).height = 30;
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const subHeaderCell = sheet.getCell(`A${row}`);
    subHeaderCell.value = 'Dire Dawa Customs Commission';
    subHeaderCell.font = { name: 'Arial', size: 12, bold: true };
    subHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(row).height = 25;
    row++;

    // Empty row
    row++;

    // Reference number (ራታ ቁጥር)
    sheet.mergeCells(`A${row}:B${row}`);
    const refCell = sheet.getCell(`A${row}`);
    refCell.value = `ራታ ቁጥር: ${group.tender.tenderNumber}/${group.code}`;
    refCell.font = { name: 'Nyala', size: 11 };
    refCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Date (ቀን)
    sheet.mergeCells(`A${row}:B${row}`);
    const dateCell = sheet.getCell(`A${row}`);
    dateCell.value = `ቀን: ${ethiopianDate}`;
    dateCell.font = { name: 'Nyala', size: 11 };
    dateCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Empty row
    row++;

    // Title
    sheet.mergeCells(`A${row}:B${row}`);
    const titleCell = sheet.getCell(`A${row}`);
    titleCell.value = 'የመሸኛ ደብደዳቤ';
    titleCell.font = { name: 'Nyala', size: 14, bold: true, underline: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(row).height = 25;
    row++;

    // Empty row
    row++;

    // Recipient (ለ:)
    sheet.mergeCells(`A${row}:B${row}`);
    const recipientCell = sheet.getCell(`A${row}`);
    recipientCell.value = `ለ: ${winner.bidder.name}`;
    recipientCell.font = { name: 'Nyala', size: 11, bold: true };
    recipientCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    if (winner.bidder.companyName) {
      sheet.mergeCells(`A${row}:B${row}`);
      const companyCell = sheet.getCell(`A${row}`);
      companyCell.value = `    ${winner.bidder.companyName}`;
      companyCell.font = { name: 'Nyala', size: 11 };
      companyCell.alignment = { horizontal: 'left', vertical: 'middle' };
      row++;
    }

    // Empty row
    row++;

    // Subject (ጉዳዩ:)
    sheet.mergeCells(`A${row}:B${row}`);
    const subjectCell = sheet.getCell(`A${row}`);
    subjectCell.value = `ጉዳዩ: የጨረታ መሸነፍ ማሳወቂያ - ${group.tender.title || 'የተለያዩ እቃዎች'}`;
    subjectCell.font = { name: 'Nyala', size: 11, bold: true };
    subjectCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Empty row
    row++;

    // Body text
    sheet.mergeCells(`A${row}:B${row}`);
    const bodyCell1 = sheet.getCell(`A${row}`);
    bodyCell1.value = `በድሬዳዋ ጉምሩክ ኮሚሽን በተካሄደው ግልፅ ጨረታ ቁጥር ${group.tender.tenderNumber} ላይ በተካሄደው የጨረታ ሂደት፣ እርስዎ በኮድ ${group.code} ስር የተመዘገቡትን እቃዎች በመሸነፍዎ በደስታ እናሳውቅዎታለን።`;
    bodyCell1.font = { name: 'Nyala', size: 11 };
    bodyCell1.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    sheet.getRow(row).height = 40;
    row++;

    // Empty row
    row++;

    // Payment details header
    sheet.mergeCells(`A${row}:B${row}`);
    const paymentHeaderCell = sheet.getCell(`A${row}`);
    paymentHeaderCell.value = 'የክፍያ ዝርዝር:';
    paymentHeaderCell.font = { name: 'Nyala', size: 11, bold: true, underline: true };
    paymentHeaderCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Empty row
    row++;

    // Winning amount
    const labelCell1 = sheet.getCell(`A${row}`);
    labelCell1.value = 'የመሸነፊያ ዋጋ (ከቫት በፊት):';
    labelCell1.font = { name: 'Nyala', size: 11 };
    labelCell1.alignment = { horizontal: 'left', vertical: 'middle' };
    
    const valueCell1 = sheet.getCell(`B${row}`);
    valueCell1.value = fmt(winnerPrice);
    valueCell1.font = { name: 'Arial', size: 11, bold: true };
    valueCell1.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // 70% payment
    const labelCell2 = sheet.getCell(`A${row}`);
    labelCell2.value = '70% ክፍያ:';
    labelCell2.font = { name: 'Nyala', size: 11 };
    labelCell2.alignment = { horizontal: 'left', vertical: 'middle' };
    
    const valueCell2 = sheet.getCell(`B${row}`);
    valueCell2.value = fmt(calc70);
    valueCell2.font = { name: 'Arial', size: 11 };
    valueCell2.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // 30% payment
    const labelCell3 = sheet.getCell(`A${row}`);
    labelCell3.value = '30% ክፍያ:';
    labelCell3.font = { name: 'Nyala', size: 11 };
    labelCell3.alignment = { horizontal: 'left', vertical: 'middle' };
    
    const valueCell3 = sheet.getCell(`B${row}`);
    valueCell3.value = fmt(calc30);
    valueCell3.font = { name: 'Arial', size: 11 };
    valueCell3.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // VAT (15%)
    const labelCell4 = sheet.getCell(`A${row}`);
    labelCell4.value = '15% ቫት:';
    labelCell4.font = { name: 'Nyala', size: 11 };
    labelCell4.alignment = { horizontal: 'left', vertical: 'middle' };
    
    const valueCell4 = sheet.getCell(`B${row}`);
    valueCell4.value = fmt(vat);
    valueCell4.font = { name: 'Arial', size: 11, bold: true };
    valueCell4.alignment = { horizontal: 'left', vertical: 'middle' };
    valueCell4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    row++;

    // Total with VAT
    const labelCell5 = sheet.getCell(`A${row}`);
    labelCell5.value = 'ጠቅላላ የክፍያ ድምር:';
    labelCell5.font = { name: 'Nyala', size: 11, bold: true };
    labelCell5.alignment = { horizontal: 'left', vertical: 'middle' };
    
    const valueCell5 = sheet.getCell(`B${row}`);
    valueCell5.value = fmt(totalWithVAT);
    valueCell5.font = { name: 'Arial', size: 12, bold: true };
    valueCell5.alignment = { horizontal: 'left', vertical: 'middle' };
    valueCell5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
    row++;

    // Empty row
    row++;

    // Instructions
    sheet.mergeCells(`A${row}:B${row}`);
    const instructionCell = sheet.getCell(`A${row}`);
    instructionCell.value = 'ክፍያውን በሚከተለው መንገድ እንዲፈፅሙ እንጠይቃለን:';
    instructionCell.font = { name: 'Nyala', size: 11, bold: true };
    instructionCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const instruction1Cell = sheet.getCell(`A${row}`);
    instruction1Cell.value = '• 70% ክፍያ በ 5 የስራ ቀናት ውስጥ';
    instruction1Cell.font = { name: 'Nyala', size: 11 };
    instruction1Cell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const instruction2Cell = sheet.getCell(`A${row}`);
    instruction2Cell.value = '• 30% ክፍያ እቃውን ከመውሰድዎ በፊት';
    instruction2Cell.font = { name: 'Nyala', size: 11 };
    instruction2Cell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Empty rows
    row += 2;

    // Closing
    sheet.mergeCells(`A${row}:B${row}`);
    const closingCell = sheet.getCell(`A${row}`);
    closingCell.value = 'እንኳን ደስ አለዎት!';
    closingCell.font = { name: 'Nyala', size: 11, bold: true };
    closingCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    // Empty rows
    row += 2;

    // Signature section
    sheet.mergeCells(`A${row}:B${row}`);
    const signatureCell = sheet.getCell(`A${row}`);
    signatureCell.value = 'ከሰላምታ ጋር';
    signatureCell.font = { name: 'Nyala', size: 11 };
    signatureCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const nameCell = sheet.getCell(`A${row}`);
    nameCell.value = '_______________________';
    nameCell.font = { name: 'Arial', size: 11 };
    nameCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const titleSignCell = sheet.getCell(`A${row}`);
    titleSignCell.value = 'የጨረታ ኮሚቴ ሰብሳቢ';
    titleSignCell.font = { name: 'Nyala', size: 11 };
    titleSignCell.alignment = { horizontal: 'left', vertical: 'middle' };
    row++;

    sheet.mergeCells(`A${row}:B${row}`);
    const commissionCell = sheet.getCell(`A${row}`);
    commissionCell.value = 'ድሬዳዋ ጉምሩክ ኮሚሽን';
    commissionCell.font = { name: 'Nyala', size: 11 };
    commissionCell.alignment = { horizontal: 'left', vertical: 'middle' };

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const safeCode = group.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Winner_Letter_Excel_${safeCode}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

    if (req.userId) {
      prisma.auditLog.create({
        data: { 
          userId: req.userId, 
          action: 'EXPORT_WINNER_LETTER_EXCEL', 
          entity: 'Group', 
          entityId: groupId, 
          details: JSON.stringify({ 
            groupCode: group.code, 
            winnerName: winner.bidder.name,
            winnerPrice 
          }), 
          ipAddress: req.ip 
        }
      }).catch(() => {});
    }
  } catch (error) { next(error); }
});

module.exports = router;
