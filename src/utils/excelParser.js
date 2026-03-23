const XLSX = require('xlsx');
const fs = require('fs');

/**
 * Parse Excel file with Amharic headers
 * Handles multi-row headers and merged cells
 */
async function parseExcelFile(filePath, tenderId) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row detection
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      blankrows: false
    });

    // Find header row (look for Amharic identifiers)
    const headerRowIndex = findHeaderRow(rawData);
    
    if (headerRowIndex === -1) {
      throw new Error('Could not find valid header row in Excel file');
    }

    // Get headers from the identified row
    const headers = rawData[headerRowIndex];
    
    // Map column indices to field names
    const headerMap = mapHeaders(headers);
    
    if (!headerMap.groupCode) {
      throw new Error('Could not find group code column (ኮድ)');
    }

    // Parse data rows
    const groups = [];
    let currentGroup = null;
    let groupIndex = 0;

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      // Skip empty rows
      if (!row || isEmptyRow(row)) {
        continue;
      }

      // Check if this is a group header row
      const groupCode = getValue(row, headerMap.groupCode);
      const groupName = getValue(row, headerMap.groupName);
      
      if (groupCode && isValidGroupCode(groupCode)) {
        // New group starts
        if (currentGroup) {
          groups.push(currentGroup);
        }
        
        currentGroup = {
          code: cleanGroupCode(groupCode),
          name: groupName || `Group ${++groupIndex}`,
          items: []
        };
        
        continue;
      }

      // Parse item row
      if (currentGroup) {
        const itemCode = getValue(row, headerMap.itemCode);
        
        if (itemCode && isNumeric(itemCode)) {
          const item = parseItemRow(row, headerMap);
          
          if (item) {
            currentGroup.items.push(item);
          }
        }
      }
    }

    // Add last group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    // Validate data
    if (groups.length === 0) {
      throw new Error('No valid groups found in Excel file');
    }

    // Log parsing results
    console.log(`Parsed ${groups.length} groups with ${groups.reduce((sum, g) => sum + g.items.length, 0)} items`);

    return { groups };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Find the header row by looking for Amharic or English identifiers
 */
function findHeaderRow(data) {
  const headerPatterns = [
    'ኮድ',    // Amharic code
    'Code',   // English
    'ዕቃ',    // Amharic item
    'Item',   // English
    'ቁም',    // Amharic quantity
    'Qty',    // English
    'Quantity'
  ];

  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rowStr = row.join(' ').toLowerCase();
    
    for (const pattern of headerPatterns) {
      if (rowStr.includes(pattern.toLowerCase())) {
        return i;
      }
    }
  }

  // Default to first row with content
  for (let i = 0; i < data.length; i++) {
    if (!isEmptyRow(data[i])) {
      return i;
    }
  }

  return 0;
}

/**
 * Map column indices to field names
 */
function mapHeaders(headers) {
  const map = {};
  
  // Common Amharic and English header variations
  const headerMappings = {
    groupCode: ['ኮድ', 'Code', 'Group Code', 'ግብረ ሃሳብ ቁም', 'Group'],
    groupName: ['Name', 'Description', 'ስም', 'Group Name'],
    itemCode: ['ቁም ቁረጠ', 'Item Code', 'Code', 'Item No'],
    serialNumber: ['ተ.ቁ', 'Serial No', 'Serial', 'Serial Number'],
    itemName: ['ዕቃ', 'Item', 'Description', 'Name'],
    itemType: ['የእቃው አይነት', 'Item Type', 'Type'],
    brand: ['ምርት', 'Brand', 'ማርክ'],
    country: ['ሀገር', 'Country', 'Origin', 'ስሪት ሀገር'],
    unit: ['አሃድ', 'Unit', 'መለኪያ'],
    warehouse1: ['መጋዘን 1', 'Warehouse 1', 'WH1', 'Warehouse1'],
    warehouse2: ['መጋዘን 2', 'Warehouse 2', 'WH2', 'Warehouse2'],
    warehouse3: ['መጋዘን 3', 'Warehouse 3', 'WH3', 'Warehouse3'],
    quantity: ['ቁም', 'Qty', 'Quantity', 'ብዛት', 'ቁምቢራ', 'ጠቅላላ ድምር', 'Total'],
    fob: ['FOB', 'fob', 'ኤፍኦቢ'],
    cif: ['CIF', 'cif', 'ሲአይኤፍ'],
    tax: ['Tax', 'TAX', 'ግብር']
  };

  headers.forEach((header, index) => {
    const headerStr = String(header).trim().toLowerCase();
    
    for (const [fieldName, patterns] of Object.entries(headerMappings)) {
      for (const pattern of patterns) {
        if (headerStr.includes(pattern.toLowerCase())) {
          map[fieldName] = index;
          break;
        }
      }
      if (map[fieldName] !== undefined) break;
    }
  });

  return map;
}

/**
 * Get value from row at mapped index
 */
function getValue(row, index) {
  if (index === undefined || index === null || index >= row.length) {
    return null;
  }
  
  const value = row[index];
  return value !== undefined && value !== '' ? value : null;
}

/**
 * Check if row is empty
 */
function isEmptyRow(row) {
  if (!row || !Array.isArray(row)) return true;
  return row.every(cell => !cell || String(cell).trim() === '');
}

/**
 * Check if group code is valid format
 */
function isValidGroupCode(code) {
  if (!code) return false;
  const str = String(code).trim();
  // Check for patterns like "10", "ኮድ-10", "Code 10", etc.
  return /^\d+$/.test(str) || /^(ኮድ|Code)[\s\-]?\d+$/i.test(str) || /^[\u1200-\u137F]/.test(str);
}

/**
 * Clean and normalize group code
 */
function cleanGroupCode(code) {
  const str = String(code).trim();
  
  // Remove common prefixes
  const cleaned = str
    .replace(/^(ኮድ|Code)[\s\-]?/i, '')
    .replace(/^[\u1200-\u137F]+[\s\-]?/, ''); // Remove Amharic prefix

  return `ኮድ-${cleaned}`;
}

/**
 * Parse item row into object
 */
function parseItemRow(row, headerMap) {
  // Get warehouse quantities
  const wh1 = parseQuantity(getValue(row, headerMap.warehouse1));
  const wh2 = parseQuantity(getValue(row, headerMap.warehouse2));
  const wh3 = parseQuantity(getValue(row, headerMap.warehouse3));
  const qty = parseQuantity(getValue(row, headerMap.quantity));
  
  // Calculate total quantity (sum of warehouses or direct quantity)
  const totalQuantity = (wh1 + wh2 + wh3) || qty;

  const item = {
    itemCode: String(getValue(row, headerMap.itemCode)).trim(),
    serialNumber: getValue(row, headerMap.serialNumber) || null,
    name: getValue(row, headerMap.itemName) || 'Unknown Item',
    itemType: getValue(row, headerMap.itemType) || null,
    brand: getValue(row, headerMap.brand) || null,
    country: getValue(row, headerMap.country) || null,
    unit: getValue(row, headerMap.unit) || 'EA',
    warehouse1: wh1,
    warehouse2: wh2,
    warehouse3: wh3,
    totalQuantity: totalQuantity,
    fob: parsePrice(getValue(row, headerMap.fob)),
    cif: parsePrice(getValue(row, headerMap.cif)),
    tax: parsePrice(getValue(row, headerMap.tax))
  };

  // Validate required fields
  if (!item.itemCode || item.totalQuantity === 0) {
    return null;
  }

  // Default prices if not provided
  if (!item.cif) item.cif = 0;
  if (!item.fob) item.fob = 0;
  if (!item.tax) item.tax = 0;

  return item;
}

/**
 * Parse quantity (handle various formats)
 */
function parseQuantity(value) {
  if (!value) return 0;
  
  const str = String(value).trim();
  const num = parseFloat(str.replace(/,/g, ''));
  
  return isNaN(num) ? 0 : Math.floor(num);
}

/**
 * Parse price (handle currency formats)
 */
function parsePrice(value) {
  if (!value) return 0;
  
  const str = String(value).trim()
    .replace(/[$€£¥]/g, '')
    .replace(/,/g, '');
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Check if value is numeric
 */
function isNumeric(value) {
  if (!value) return false;
  const str = String(value).trim();
  return /^\d+$/.test(str) || /^\d+\.?\d*$/.test(str);
}

module.exports = { parseExcelFile };