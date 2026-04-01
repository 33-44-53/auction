const ExcelJS = require('exceljs');

async function createFormattedExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tender Data');

  // Row 1: Exchange Rate (tender-level)
  sheet.getCell('A1').value = 'Exchange Rate';
  sheet.getCell('B1').value = 157.098;

  // Row 2: Empty

  // Row 3: Header row with group metadata columns
  const headers = [
    'ኮድ',
    'Title',
    'የተያዘበት ቀን',
    'የተያዘበት ቦታ',
    'ያዥው አካል',
    'የእቃው አይነት',
    'ማርክ',
    'ስሪት ሀገር',
    'መለኪያ',
    'መጋዘን1',
    'መጋዘን 2',
    'መጋዝን 3',
    'ሞዴል',
    'የአንድ ዋጋ (FOB)',
    'የአንድ ዋጋ (CIF)',
    'የአንድ ዋጋ (TAX)'
  ];
  
  headers.forEach((header, index) => {
    const cell = sheet.getCell(3, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
  });

  // Group 1 - first item with metadata
  sheet.getCell('A4').value = 'ኮድ-10';
  sheet.getCell('B4').value = 'የተለያዩ የምግብነኮች';
  sheet.getCell('C4').value = '16-05-2018';
  sheet.getCell('D4').value = 'ከሀረር';
  sheet.getCell('E4').value = 'Dire Dawa Customs Commission';
  sheet.getCell('F4').value = 'የሞባይል ቀፎ KL4.64gb tr3 pop 9';
  sheet.getCell('G4').value = 'tecno';
  sheet.getCell('H4').value = 'china';
  sheet.getCell('I4').value = 'ዘቁጥር';
  sheet.getCell('J4').value = 0;
  sheet.getCell('K4').value = 445;
  sheet.getCell('L4').value = 0;
  sheet.getCell('M4').value = '99861';
  sheet.getCell('N4').value = 13673.11;
  sheet.getCell('O4').value = 13673.11;
  sheet.getCell('P4').value = 13673.11;

  // Group 1 - second item (no metadata)
  sheet.getCell('F5').value = 'የሞባይል ቀፎ kl128 GB R4';
  sheet.getCell('G5').value = 'tecno';
  sheet.getCell('H5').value = 'china';
  sheet.getCell('I5').value = 'ዘቁጥር';
  sheet.getCell('J5').value = 0;
  sheet.getCell('K5').value = 488;
  sheet.getCell('L5').value = 0;
  sheet.getCell('M5').value = '99861';
  sheet.getCell('N5').value = 18919.55;
  sheet.getCell('O5').value = 18919.55;
  sheet.getCell('P5').value = 18919.55;

  // Group 2 - first item with different metadata
  sheet.getCell('A6').value = 'ኮድ-7';
  sheet.getCell('B6').value = 'የተለያዩ የኤሌክትሮኒክስ እቃዎች';
  sheet.getCell('C6').value = '20-06-2018';
  sheet.getCell('D6').value = 'ከድሬዳዋ';
  sheet.getCell('E6').value = 'Dire Dawa Customs Commission';
  sheet.getCell('F6').value = 'የሞባይል ቀፎ M14 64GB RM4';
  sheet.getCell('G6').value = 'samsung';
  sheet.getCell('H6').value = 'India';
  sheet.getCell('I6').value = 'ዘቁጥር';
  sheet.getCell('J6').value = 0;
  sheet.getCell('K6').value = 110;
  sheet.getCell('L6').value = 0;
  sheet.getCell('M6').value = '99856';
  sheet.getCell('N6').value = 15836.74;
  sheet.getCell('O6').value = 15836.74;
  sheet.getCell('P6').value = 15836.74;

  // Column widths
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 15;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 30;
  sheet.getColumn(6).width = 35;
  sheet.getColumn(7).width = 12;
  sheet.getColumn(8).width = 12;
  sheet.getColumn(9).width = 10;
  sheet.getColumn(10).width = 10;
  sheet.getColumn(11).width = 10;
  sheet.getColumn(12).width = 10;
  sheet.getColumn(13).width = 15;
  sheet.getColumn(14).width = 15;
  sheet.getColumn(15).width = 15;
  sheet.getColumn(16).width = 15;

  await workbook.xlsx.writeFile('c:\\Users\\Oumer\\Desktop\\auction\\Tender_GroupMetadata.xlsx');
  console.log('✓ Created Tender_GroupMetadata.xlsx');
}

createFormattedExcel().catch(console.error);
