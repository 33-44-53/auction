const ExcelJS = require('exceljs');

async function createFormattedExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tender Data');

  // Row 1: Header row with all metadata columns
  const headers = [
    'ኮድ',
    'Title',
    'የተያዘበት ቀን',
    'የተያዘበት ቦታ',
    'ያዥው አካል',
    'Exchange Rate',
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
    const cell = sheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
  });

  // Group 1 - first item with metadata
  sheet.getCell('A2').value = 'ኮድ-10';
  sheet.getCell('B2').value = 'የተለያዩ የምግብነኮች';
  sheet.getCell('C2').value = '16-05-2018';
  sheet.getCell('D2').value = 'ከሀረር';
  sheet.getCell('E2').value = 'Dire Dawa Customs Commission';
  sheet.getCell('F2').value = 157.098;
  sheet.getCell('G2').value = 'የሞባይል ቀፎ KL4.64gb tr3 pop 9';
  sheet.getCell('H2').value = 'tecno';
  sheet.getCell('I2').value = 'china';
  sheet.getCell('J2').value = 'ዘቁጥር';
  sheet.getCell('K2').value = 0;
  sheet.getCell('L2').value = 445;
  sheet.getCell('M2').value = 0;
  sheet.getCell('N2').value = '99861';
  sheet.getCell('O2').value = 13673.11;
  sheet.getCell('P2').value = 13673.11;
  sheet.getCell('Q2').value = 13673.11;

  // Group 1 - second item (no metadata)
  sheet.getCell('G3').value = 'የሞባይል ቀፎ kl128 GB R4';
  sheet.getCell('H3').value = 'tecno';
  sheet.getCell('I3').value = 'china';
  sheet.getCell('J3').value = 'ዘቁጥር';
  sheet.getCell('K3').value = 0;
  sheet.getCell('L3').value = 488;
  sheet.getCell('M3').value = 0;
  sheet.getCell('N3').value = '99861';
  sheet.getCell('O3').value = 18919.55;
  sheet.getCell('P3').value = 18919.55;
  sheet.getCell('Q3').value = 18919.55;

  // Group 2 - first item with different metadata and exchange rate
  sheet.getCell('A4').value = 'ኮድ-7';
  sheet.getCell('B4').value = 'የተለያዩ የኤሌክትሮኒክስ እቃዎች';
  sheet.getCell('C4').value = '20-06-2018';
  sheet.getCell('D4').value = 'ከድሬዳዋ';
  sheet.getCell('E4').value = 'Dire Dawa Customs Commission';
  sheet.getCell('F4').value = 160.5;
  sheet.getCell('G4').value = 'የሞባይል ቀፎ M14 64GB RM4';
  sheet.getCell('H4').value = 'samsung';
  sheet.getCell('I4').value = 'India';
  sheet.getCell('J4').value = 'ዘቁጥር';
  sheet.getCell('K4').value = 0;
  sheet.getCell('L4').value = 110;
  sheet.getCell('M4').value = 0;
  sheet.getCell('N4').value = '99856';
  sheet.getCell('O4').value = 15836.74;
  sheet.getCell('P4').value = 15836.74;
  sheet.getCell('Q4').value = 15836.74;

  // Column widths
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 15;
  sheet.getColumn(4).width = 15;
  sheet.getColumn(5).width = 30;
  sheet.getColumn(6).width = 15;
  sheet.getColumn(7).width = 35;
  sheet.getColumn(8).width = 12;
  sheet.getColumn(9).width = 12;
  sheet.getColumn(10).width = 10;
  sheet.getColumn(11).width = 10;
  sheet.getColumn(12).width = 10;
  sheet.getColumn(13).width = 10;
  sheet.getColumn(14).width = 15;
  sheet.getColumn(15).width = 15;
  sheet.getColumn(16).width = 15;
  sheet.getColumn(17).width = 15;

  await workbook.xlsx.writeFile('c:\\Users\\Oumer\\Desktop\\auction\\Tender_GroupMetadata_Final.xlsx');
  console.log('✓ Created Tender_GroupMetadata_Final.xlsx');
}

createFormattedExcel().catch(console.error);
