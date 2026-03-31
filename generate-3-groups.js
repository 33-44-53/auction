const ExcelJS = require('exceljs');

async function generateThreeGroupsExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('ጨረታ');

  // Tender metadata (first few rows)
  sheet.getCell('A1').value = 'Tender Number';
  sheet.getCell('B1').value = '033/2018';
  
  sheet.getCell('A2').value = 'Title';
  sheet.getCell('B2').value = 'የተለያዩ የምግብነኮች';
  
  sheet.getCell('A3').value = 'የተያዘበት ቀን';
  sheet.getCell('B3').value = '16-05-2018';
  
  sheet.getCell('A4').value = 'የተያዘበት ቦታ';
  sheet.getCell('B4').value = 'ከሀረር';
  
  sheet.getCell('A5').value = 'ያዥው አካል';
  sheet.getCell('B5').value = 'Dire Dawa Customs Commission';
  
  sheet.getCell('A6').value = 'Exchange Rate';
  sheet.getCell('B6').value = 157.098;

  // Headers (row 7)
  const headers = [
    'ኮድ',           // A - Group Code
    'የእቃው አይነት',   // B - Item Name
    'ማርክ',          // C - Brand
    'ስሪት ሀገር',     // D - Country
    'መለኪያ',         // E - Unit
    'መጋዘን1',        // F - Warehouse 1
    'መጋዘን 2',       // G - Warehouse 2
    'መጋዝን 3',       // H - Warehouse 3
    'ጠቅላላ ድምር',    // I - Total Quantity
    'መነሻ ዋጋ',       // J - Unit Price
    'ጠቅላላ ዋጋ',     // K - Total Price
    'ሞዴል',          // L - Model/Item Code
    'የአንድ ዋጋ (FOB)', // M - FOB
    'የአንድ ዋጋ (CIF)', // N - CIF
    'የአንድ ዋጋ (TAX)'  // O - TAX
  ];

  headers.forEach((header, index) => {
    const cell = sheet.getCell(7, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Data rows
  // GROUP 1 (ኮድ-32): CIF=26 (highest), FOB=25, TAX=24
  // GROUP 2 (ኮድ-33): FOB=25 (highest), CIF=24, TAX=23
  // GROUP 3 (ኮድ-34): TAX=24 (highest), CIF=23, FOB=22
  
  const items = [
    // ===== GROUP 1: ኮድ-32 (CIF is highest) =====
    ['ኮድ-32', 'የምግብ ዘይት ባለ20L', 'OMAAR', 'S.land', 'በጀርካን', 25, 0, 0, 25, 4152.10, 103802.50, '100548', 25, 26, 24],
    ['', 'የምግብ ዘይት ባለ3L', 'HAYAT', 'S.land', 'በቁጥር', 11, 0, 0, 11, 622.11, 6843.19, '100548', 25, 26, 24],
    ['', 'ሩዝ ባለ25 kg', 'ppp', 'India', 'በከረጢት', 6, 0, 0, 6, 2595.26, 15571.55, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'OMAAR', 'India', 'በከረጢት', 18, 0, 0, 18, 2427.16, 43688.95, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'fssat', 'India', 'በከረጢት', 11, 0, 0, 11, 2427.16, 26698.81, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'silvor', 'የለዉም', 'በከረጢት', 1, 0, 0, 1, 2427.16, 2427.16, '100458', 25, 26, 24],
    ['', 'ስካር ባለ50 kg', 'fssat', 'India', 'በከረጢት', 4, 0, 0, 4, 4855.90, 19423.60, '100458', 25, 26, 24],
    ['', 'የዳቦ ዱቄት ባለ25 kg', 'የለዉም', 'egypt', 'በከረጢት', 7, 0, 0, 7, 2125.54, 14878.75, '100549', 25, 26, 24],
    ['', 'ሰርዲር 48×95g', 'OMAAR', 'Thailand', 'በካርቶን', 16, 0, 0, 16, 3630.53, 58088.56, '52253', 25, 26, 24],
    ['', 'አናናስ 12×565g', 'bader', 'Thailand', 'በካርቶን', 1, 0, 0, 1, 1955.87, 1955.87, '52252', 25, 26, 24],
    ['', 'የአትክልት ቅቤ 09.kg', 'sheno', 'yemen', 'በቁጥር', 47, 0, 0, 47, 389.60, 18311.34, '52253', 25, 26, 24],
    
    // ===== GROUP 2: ኮድ-33 (FOB is highest) =====
    ['ኮድ-33', 'ብስኩት 1×24pcs×120g', 'Shirinasal', 'iran', 'በካርቶን', 3, 0, 0, 3, 754.07, 2262.21, '52253', 25, 24, 23],
    ['', 'ብስኩት 24pcs×150gram', 'deemah', 'S.land', 'በካረቶን', 6, 0, 0, 6, 879.75, 5278.49, '52253', 25, 24, 23],
    ['', 'Abululad 48×90gram', 'teashop', 'yemen', 'በካርቶን', 6, 0, 0, 6, 730.51, 4383.03, '52253', 25, 24, 23],
    ['', 'ፓስታ 20×500gram', 'parlin', 'oman', 'በካርቶን', 12, 0, 0, 12, 1723.37, 20680.38, '52253', 25, 24, 23],
    ['', 'ድፍን ምስር 15kg', 'mellow', 'uae', 'በከረጢት', 5, 0, 0, 5, 2189.95, 10949.73, '52253', 25, 24, 23],
    ['', 'ፓስታ 20×500gram', 'mutulu', 'turkey', 'በካርቶ', 6, 0, 0, 6, 1723.37, 10340.19, '52253', 25, 24, 23],
    ['', 'ቴምር 5kg', 'saad', 'uae', 'በካርቶን', 5, 0, 0, 5, 596.97, 2984.86, '52253', 25, 24, 23],
    ['', 'ማስቲካ 250g/20paket', 'banana', 'vietnam', 'በእሽግ', 22, 0, 0, 22, 164.95, 3628.96, '52253', 25, 24, 23],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'Bubblegum', 'India', 'በእሽግ', 277, 0, 0, 277, 193.23, 53524.86, '52278', 25, 24, 23],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'lollypop', 'India', 'በእሽግ', 18, 0, 0, 18, 193.23, 3478.15, '52278', 25, 24, 23],
    ['', 'ቸኮሌት 105pcs 472gram', 'Happy caw', 'India', 'በእሽግ', 38, 0, 0, 38, 212.08, 8059.13, '52278', 25, 24, 23],
    
    // ===== GROUP 3: ኮድ-34 (TAX is highest) =====
    ['ኮድ-34', 'ባለ እንጨት ከረሜላ 48pcs', 'bon bon', 'India', 'በእሽግ', 37, 0, 0, 37, 193.23, 7149.53, '52278', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 100gram', 'big', 'India', 'በእሽግ', 397, 0, 0, 397, 193.23, 76712.52, '52278', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'bigbll', 'India', 'በእሽግ', 507, 0, 0, 507, 193.23, 97967.88, '52279', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'bigboII', 'India', 'በእሽግ', 339, 0, 0, 339, 193.23, 65505.15, '52279', 22, 23, 24],
    ['', 'ዘይቱና ጁስ 250ml', 'faragello', 'egypt', 'በቁጥር', 93, 0, 0, 93, 39.27, 3652.53, '52252', 22, 23, 24],
    ['', 'ሰርዲን 95gram', 'ommar', 'thailand', 'በቁጥር', 226, 0, 0, 226, 75.41, 17041.99, '52257', 22, 23, 24],
    ['', 'ፓስታ 500g', 'mututu', 'turkey', 'በቁጥር', 675, 0, 0, 675, 84.83, 57262.22, '52278', 22, 23, 24],
    ['', 'ቴምር 1KG', 'almadina', 'የለዉም', 'በእሽግ', 35, 0, 0, 35, 119.39, 4178.81, '52279', 22, 23, 24],
    ['', 'white otatr 400g', 'royal', 'uae', 'በቁጥር', 74, 0, 0, 74, 238.79, 17670.38, '52258', 22, 23, 24],
    ['', 'natural oats 400g', 'rino', 'uae', 'በቁጥር', 24, 0, 0, 24, 238.79, 5730.94, '52258', 22, 23, 24],
    ['', 'Crimla chocolat 48pcs', 'fun2', 'India', 'በፓኬት', 45, 0, 0, 45, 149.24, 6715.94, '52277', 22, 23, 24]
  ];

  let currentRow = 8;
  items.forEach(item => {
    item.forEach((value, colIndex) => {
      const cell = sheet.getCell(currentRow, colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Format numbers
      if (typeof value === 'number' && colIndex >= 5) {
        cell.numFmt = '#,##0.00';
      }
    });
    currentRow++;
  });

  // Set column widths
  sheet.getColumn(1).width = 10;  // Code
  sheet.getColumn(2).width = 35;  // Item Name
  sheet.getColumn(3).width = 15;  // Brand
  sheet.getColumn(4).width = 12;  // Country
  sheet.getColumn(5).width = 12;  // Unit
  sheet.getColumn(6).width = 10;  // WH1
  sheet.getColumn(7).width = 10;  // WH2
  sheet.getColumn(8).width = 10;  // WH3
  sheet.getColumn(9).width = 12;  // Total Qty
  sheet.getColumn(10).width = 15; // Unit Price
  sheet.getColumn(11).width = 15; // Total Price
  sheet.getColumn(12).width = 12; // Model
  sheet.getColumn(13).width = 12; // FOB
  sheet.getColumn(14).width = 12; // CIF
  sheet.getColumn(15).width = 12; // TAX

  // Save file
  await workbook.xlsx.writeFile('Tender_3_Groups.xlsx');
  console.log('✅ Excel file created: Tender_3_Groups.xlsx');
  console.log('📁 Location: c:\\Users\\Oumer\\Desktop\\auction\\Tender_3_Groups.xlsx');
  console.log('\n📊 Groups Summary:');
  console.log('   ኮድ-32: 11 items - CIF=26 (highest), FOB=25, TAX=24');
  console.log('   ኮድ-33: 11 items - FOB=25 (highest), CIF=24, TAX=23');
  console.log('   ኮድ-34: 11 items - TAX=24 (highest), CIF=23, FOB=22');
  console.log('\n📤 Upload this file to your system!');
  console.log('   Round 1 for ኮድ-32 will be: CIF');
  console.log('   Round 1 for ኮድ-33 will be: FOB');
  console.log('   Round 1 for ኮድ-34 will be: TAX');
}

generateThreeGroupsExcel().catch(console.error);
