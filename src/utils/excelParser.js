const XLSX = require('xlsx');

async function parseExcelFile(filePath, tenderId) {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });

    const headerRowIndex = findHeaderRow(rawData);
    if (headerRowIndex === -1) throw new Error('Could not find valid header row in Excel file');

    const tenderMeta = parseTenderMeta(rawData, headerRowIndex);
    const headerMap = mapHeaders(rawData[headerRowIndex]);

    if (headerMap.groupCode === undefined) throw new Error('Could not find group code column (Code / ኮድ)');

    const groups = [];
    let currentGroup = null;
    let groupIndex = 0;

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || isEmptyRow(row)) continue;

      const groupCode = getValue(row, headerMap.groupCode);
      const groupName = getValue(row, headerMap.groupName);

      if (groupCode !== null && String(groupCode).trim() !== '') {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = {
          code: cleanGroupCode(groupCode),
          name: groupName || `Group ${++groupIndex}`,
          items: []
        };
        // Also parse this row as an item
        const item = parseItemRow(row, headerMap);
        if (item) currentGroup.items.push(item);
      } else if (currentGroup) {
        const item = parseItemRow(row, headerMap);
        if (item) currentGroup.items.push(item);
      }
    }

    if (currentGroup) groups.push(currentGroup);
    if (groups.length === 0) throw new Error('No valid groups found in Excel file');

    console.log(`Parsed ${groups.length} groups with ${groups.reduce((s, g) => s + g.items.length, 0)} items`);
    return { groups, tenderMeta };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

function parseTenderMeta(data, headerRowIndex) {
  const meta = {};
  const metaKeys = {
    tenderNumber:    ['tender number', 'tender no', 'tender#', 'የጨረታ ቁጥር', 'ቁጥር'],
    title:           ['title', 'tender title', 'ስም', 'የጨረታ ስም'],
    date:            ['date', 'tender date', 'ቀን', 'የተያዘበት ቀን'],
    location:        ['location', 'place', 'ቦታ', 'የተያዘበት ቦታ'],
    responsibleBody: ['responsible body', 'responsible', 'ያዥው አካል', 'የሀላፊነት አካል'],
    exchangeRate:    ['exchange rate', 'rate', 'የምንዛሪ', 'exchange'],
  };

  for (let i = 0; i < headerRowIndex; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;
    const keyCell = String(row[0] || '').trim().toLowerCase();
    const valCell = (row[1] !== undefined && row[1] !== '') ? row[1] : null;
    if (!keyCell || valCell === null) continue;
    
    // Debug log
    console.log(`Row ${i}: Key="${keyCell}", Value="${valCell}"`);
    
    for (const [field, patterns] of Object.entries(metaKeys)) {
      if (patterns.some(p => keyCell.includes(p.toLowerCase()))) {
        meta[field] = String(valCell).trim();
        console.log(`  Matched ${field}: ${meta[field]}`);
        break;
      }
    }
  }
  return meta;
}

function findHeaderRow(data) {
  const keywords = ['code', 'item', 'name', 'qty', 'quantity', 'fob', 'cif', 'tax',
    'unit', 'brand', 'country', 'warehouse', 'ኮድ', 'ዕቃ', 'አሃድ', 'መጋዘን'];

  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (!row || row.length < 3) continue;
    const matches = row.filter(cell => {
      const s = String(cell || '').trim().toLowerCase();
      return s && keywords.some(k => s.includes(k));
    });
    if (matches.length >= 2) return i;
  }
  for (let i = 0; i < data.length; i++) {
    if (!isEmptyRow(data[i])) return i;
  }
  return 0;
}

function mapHeaders(headers) {
  const map = {};
  const mappings = {
    groupCode:    ['ኮድ', 'Code', 'Group Code'],
    groupName:    ['Group Name', 'Group Description', 'Name', 'ስም'],
    itemCode:     ['Item Code', 'Item No', 'ቁም ቁረጠ', 'Model'],
    serialNumber: ['Serial No', 'Serial Number', 'Serial', 'ተ.ቁ'],
    itemName:     ['Item Name', 'ዕቃ', 'የእቃው አይነት', 'Item Type'],
    itemType:     ['Item Type', 'Type', 'የእቃው አይነት'],
    brand:        ['Brand', 'ምርት', 'ማርክ'],
    country:      ['Country', 'Origin', 'ሀገር', 'ስሪት ሀገር'],
    unit:         ['Unit', 'አሃድ', 'መለኪያ'],
    warehouse1:   ['Warehouse 1', 'WH1', 'Warehouse1', 'መጋዘን 1', 'መጋዘን1', 'መጋዝን 1', 'መጋዝን1'],
    warehouse2:   ['Warehouse 2', 'WH2', 'Warehouse2', 'መጋዘን 2', 'መጋዘን2', 'መጋዝን 2', 'መጋዝን2'],
    warehouse3:   ['Warehouse 3', 'WH3', 'Warehouse3', 'መጋዘን 3', 'መጋዘን3', 'መጋዝን 3', 'መጋዝን3'],
    quantity:     ['Qty', 'Quantity', 'ብዛት', 'ጠቅላላ ድምር', 'Total Qty'],
    fob:          ['FOB', 'ኤፍኦቢ'],
    cif:          ['CIF', 'ሲአይኤፍ'],
    tax:          ['Tax', 'TAX', 'ግብር'],
  };

  headers.forEach((header, index) => {
    const s = String(header).trim().toLowerCase();
    if (!s) return;
    for (const [field, patterns] of Object.entries(mappings)) {
      if (map[field] !== undefined) continue;
      if (patterns.some(p => s === p.toLowerCase() || s.includes(p.toLowerCase()))) {
        map[field] = index;
      }
    }
  });

  // If no dedicated 'Item Name' column, fall back to the 'Name' column
  if (map.itemName === undefined) map.itemName = map.groupName;

  return map;
}

function getValue(row, index) {
  if (index === undefined || index === null || index >= row.length) return null;
  const v = row[index];
  return (v !== undefined && v !== '') ? v : null;
}

function isEmptyRow(row) {
  if (!row || !Array.isArray(row)) return true;
  return row.every(cell => cell === '' || cell === null || cell === undefined);
}

function cleanGroupCode(code) {
  const str = String(code).trim();
  const cleaned = str.replace(/^(ኮድ|Code)[\s\-]?/i, '');
  return `ኮድ-${cleaned}`;
}

function parseItemRow(row, headerMap) {
  const wh1 = parseQuantity(getValue(row, headerMap.warehouse1));
  const wh2 = parseQuantity(getValue(row, headerMap.warehouse2));
  const wh3 = parseQuantity(getValue(row, headerMap.warehouse3));
  const qty = parseQuantity(getValue(row, headerMap.quantity));
  const totalQuantity = (wh1 + wh2 + wh3) || qty;

  const nameVal = getValue(row, headerMap.itemName) || getValue(row, headerMap.groupName);
  if (!nameVal) return null;

  return {
    itemCode:     getValue(row, headerMap.itemCode) ? String(getValue(row, headerMap.itemCode)).trim() : '-',
    serialNumber: getValue(row, headerMap.serialNumber) || null,
    name:         String(nameVal),
    itemType:     getValue(row, headerMap.itemType) || null,
    brand:        getValue(row, headerMap.brand) || null,
    country:      getValue(row, headerMap.country) || null,
    unit:         getValue(row, headerMap.unit) || 'EA',
    warehouse1:   wh1,
    warehouse2:   wh2,
    warehouse3:   wh3,
    totalQuantity,
    fob:          parsePrice(getValue(row, headerMap.fob)),
    cif:          parsePrice(getValue(row, headerMap.cif)),
    tax:          parsePrice(getValue(row, headerMap.tax)),
  };
}

function parseQuantity(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(String(value).replace(/,/g, ''));
  return isNaN(num) ? 0 : Math.floor(num);
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = parseFloat(String(value).replace(/[$€£¥,]/g, ''));
  return isNaN(num) ? 0 : num;
}

module.exports = { parseExcelFile };
