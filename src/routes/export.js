const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Export tender to Excel
router.get('/excel/:tenderId', async (req, res, next) => {
  try {
    const tenderId = parseInt(req.params.tenderId);

    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        groups: {
          include: {
            items: true,
            bids: {
              include: { bidder: true },
              orderBy: { bidPrice: 'desc' }
            }
          },
          orderBy: { code: 'asc' }
        }
      }
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tender Management System';
    workbook.created = new Date();

    // Main sheet - Groups Overview
    const overviewSheet = workbook.addWorksheet('Overview', {
      properties: { tabColor: { argb: 'FF0000FF' } }
    });

    // Header styles
    const titleStyle = {
      font: { size: 14, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } },
      alignment: { horizontal: 'center' }
    };

    const headerStyle = {
      font: { size: 11, bold: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center' }
    };

    // Tender info
    overviewSheet.mergeCells('A1:G1');
    overviewSheet.getCell('A1').value = `የጨረታ ስም: ${tender.title || tender.tenderNumber}`;
    overviewSheet.getCell('A1').style = titleStyle;

    overviewSheet.getRow(3).values = ['ኮድ', 'ሁኔታ', 'ዙር', 'መነሻ ዋጋ', 'ተጫማሪዎች', 'ከፍተኛ ቅናሽ', 'አሸናፊ'];
    overviewSheet.getRow(3).eachCell((cell) => {
      cell.style = headerStyle;
    });

    let rowIndex = 4;
    for (const group of tender.groups) {
      const highestBid = group.bids.length > 0 ? group.bids[0] : null;
      const winner = group.bids.find(b => b.isWinner);

      overviewSheet.getRow(rowIndex).values = [
        group.code,
        group.status,
        group.currentRound,
        group.basePrice || 0,
        group.bids.length,
        highestBid ? highestBid.bidPrice : '-',
        winner ? winner.bidder.name : '-'
      ];
      rowIndex++;
    }

    overviewSheet.columns = [
      { width: 15 },
      { width: 12 },
      { width: 10 },
      { width: 15 },
      { width: 12 },
      { width: 15 },
      { width: 20 }
    ];

    // Group details sheet
    for (const group of tender.groups) {
      const groupSheet = workbook.addWorksheet(group.code, {
        properties: { tabColor: { argb: 'FF00B050' } }
      });

      // Items table
      groupSheet.mergeCells('A1:K1');
      groupSheet.getCell('A1').value = `${group.code} - ${group.name || 'Items'}`;
      groupSheet.getCell('A1').style = titleStyle;

      groupSheet.getRow(3).values = [
        'ቁም ቁረጠ', 'ዕቃ', 'ምርት', 'ሀገር', 'አሃድ', 'ቁም', 'FOB', 'CIF', 'Tax', 'አሃድ ዋጋ', 'ጠቅላላ ዋጋ'
      ];
      groupSheet.getRow(3).eachCell((cell) => {
        cell.style = headerStyle;
      });

      let itemRow = 4;
      for (const item of group.items) {
        groupSheet.getRow(itemRow).values = [
          item.itemCode,
          item.name,
          item.brand || '-',
          item.country || '-',
          item.unit,
          item.quantity,
          item.fob,
          item.cif,
          item.tax,
          item.unitPrice || 0,
          item.totalPrice || 0
        ];
        itemRow++;
      }

      groupSheet.columns = [
        { width: 12 }, // itemCode
        { width: 30 }, // name
        { width: 15 }, // brand
        { width: 12 }, // country
        { width: 10 }, // unit
        { width: 10 }, // quantity
        { width: 12 }, // fob
        { width: 12 }, // cif
        { width: 12 }, // tax
        { width: 15 }, // unitPrice
        { width: 15 }  // totalPrice
      ];

      // Bids section
      if (group.bids.length > 0) {
        const bidStartRow = itemRow + 2;
        groupSheet.mergeCells(`A${bidStartRow}:F${bidStartRow}`);
        groupSheet.getCell(`A${bidStartRow}`).value = 'ቅናሽዎች';
        groupSheet.getCell(`A${bidStartRow}`).style = titleStyle;

        const headerRow = bidStartRow + 1;
        groupSheet.getRow(headerRow).values = ['ተጫማሪ', 'ኩባንያዎ', 'ቅናሽ', 'ዙር', 'አሸናፊ'];
        groupSheet.getRow(headerRow).eachCell((cell) => {
          cell.style = headerStyle;
        });

        let bidRow = headerRow + 1;
        for (const bid of group.bids) {
          groupSheet.getRow(bidRow).values = [
            bid.bidder.name,
            bid.bidder.companyName,
            bid.bidPrice,
            bid.round,
            bid.isWinner ? '✓' : '-'
          ];
          bidRow++;
        }
      }
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=tender_${tender.tenderNumber}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'EXPORT_EXCEL',
        entity: 'Tender',
        entityId: tenderId,
        details: JSON.stringify({ tenderNumber: tender.tenderNumber }),
        ipAddress: req.ip
      }
    });
  } catch (error) {
    next(error);
  }
});

// Export tender to PDF
router.get('/pdf/:tenderId', async (req, res, next) => {
  let browser;
  
  try {
    const tenderId = parseInt(req.params.tenderId);

    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        groups: {
          include: {
            items: true,
            bids: {
              include: { bidder: true },
              orderBy: { bidPrice: 'desc' }
            }
          },
          orderBy: { code: 'asc' }
        }
      }
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Generate HTML content
    const htmlContent = generatePDFHTML(tender);

    // Launch browser and generate PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tender_${tender.tenderNumber}.pdf`);

    res.send(pdfBuffer);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'EXPORT_PDF',
        entity: 'Tender',
        entityId: tenderId,
        details: JSON.stringify({ tenderNumber: tender.tenderNumber }),
        ipAddress: req.ip
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Generate HTML for PDF
function generatePDFHTML(tender) {
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(num || 0);
  };

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Tender ${tender.tenderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #1F4E79; border-bottom: 2px solid #1F4E79; padding-bottom: 10px; }
        h2 { color: #2E75B6; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #D9E1F2; padding: 10px; text-align: left; border: 1px solid #ccc; font-weight: bold; }
        td { padding: 8px; border: 1px solid #ccc; }
        .tender-info { background: #F2F2F2; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .group-section { margin-bottom: 30px; page-break-inside: avoid; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 3px; font-size: 12px; }
        .status-OPEN { background: #C6EFCE; color: #006100; }
        .status-SOLD { background: #FFC7CE; color: #9C0006; }
        .status-SPLIT { background: #FFEB9C; color: #9C5700; }
        .winner { background: #C6EFCE; font-weight: bold; }
        .summary { display: flex; justify-content: space-between; margin-top: 10px; }
        .summary-item { text-align: center; }
      </style>
    </head>
    <body>
      <h1>የጨረታ ሪፖርት / Tender Report</h1>
      <div class="tender-info">
        <p><strong>የጨረታ ቁጥር / Tender Number:</strong> ${tender.tenderNumber}</p>
        <p><strong>ስም / Title:</strong> ${tender.title || '-'}</p>
        <p><strong>ቦታ / Location:</strong> ${tender.location || '-'}</p>
        <p><strong>የምንዛሪ ስርዓት / Exchange Rate:</strong> ${tender.exchangeRate}</p>
        <p><strong>ሁኔታ / Status:</strong> ${tender.status}</p>
      </div>
  `;

  for (const group of tender.groups) {
    const highestBid = group.bids.length > 0 ? group.bids[0] : null;
    const winner = group.bids.find(b => b.isWinner);

    html += `
      <div class="group-section">
        <h2>${group.code} - ${group.name || 'Group'}</h2>
        <div class="summary">
          <div class="summary-item"><strong>ሁኔታ:</strong> <span class="status status-${group.status}">${group.status}</span></div>
          <div class="summary-item"><strong>ዙር:</strong> ${group.currentRound}</div>
          <div class="summary-item"><strong>መነሻ ዋጋ:</strong> ${formatCurrency(group.basePrice)}</div>
          <div class="summary-item"><strong>ተጫማሪዎች:</strong> ${group.bids.length}</div>
        </div>

        <h3>ዕቃዎች / Items</h3>
        <table>
          <thead>
            <tr>
              <th>ቁም ቁረጠ</th>
              <th>ዕቃ</th>
              <th>ምርት</th>
              <th>ቁም</th>
              <th>FOB</th>
              <th>CIF</th>
              <th>Tax</th>
              <th>አሃድ ዋጋ</th>
              <th>ጠቅላላ</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const item of group.items) {
      html += `
        <tr>
          <td>${item.itemCode}</td>
          <td>${item.name}</td>
          <td>${item.brand || '-'}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.fob)}</td>
          <td>${formatCurrency(item.cif)}</td>
          <td>${formatCurrency(item.tax)}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td>${formatCurrency(item.totalPrice)}</td>
        </tr>
      `;
    }

    html += '</tbody></table>';

    if (group.bids.length > 0) {
      html += `
        <h3>ቅናሽዎች / Bids</h3>
        <table>
          <thead>
            <tr>
              <th>ተጫማሪ</th>
              <th>ኩባንያዎ</th>
              <th>ቅናሽ</th>
              <th>ዙር</th>
              <th>አሸናፊ</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const bid of group.bids) {
        const isWinner = bid.isWinner ? '✓' : '-';
        const rowClass = bid.isWinner ? 'winner' : '';
        html += `
          <tr class="${rowClass}">
            <td>${bid.bidder.name}</td>
            <td>${bid.bidder.companyName}</td>
            <td>${formatCurrency(bid.bidPrice)}</td>
            <td>${bid.round}</td>
            <td>${isWinner}</td>
          </tr>
        `;
      }

      html += '</tbody></table>';
    }

    html += '</div>';
  }

  html += '</body></html>';
  
  return html;
}

module.exports = router;