const ExcelJS = require('exceljs');

async function createFormattedExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tender Data');

  // Metadata rows
  sheet.getCell('A1').value = 'Title';
  sheet.getCell('B1').value = 'የተለያዩ የምግብነኮች';
  
  sheet.getCell('A2').value = 'የተያዘበት ቀን';
  sheet.getCell('B2').value = '16-05-2018';
  
  sheet.getCell('A3').value = 'የተያዘበት ቦታ';
  sheet.getCell('B3').value = 'ከሀረር';
  
  sheet.getCell('A4').value = 'ያዥው አካል';
  sheet.getCell('B4').value = 'Dire Dawa Customs Commission';
  
  sheet.getCell('A5').value = 'Exchange Rate';
  sheet.getCell('B5').value = 157.098;

  // Empty row 6

  // Header row (row 7)
  const headers = [
    'ኮድ',
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
    const cell = sheet.getCell(7, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
  });

  // Sample data rows (row 8+)
  // Group 1
  sheet.getCell('A8').value = 'ኮድ-10';
  sheet.getCell('B8').value = 'የሞባይል ቀፎ KL4.64gb tr3 pop 9';
  sheet.getCell('C8').value = 'tecno';
  sheet.getCell('D8').value = 'china';
  sheet.getCell('E8').value = 'ዘቁጥር';
  sheet.getCell('F8').value = 0;
  sheet.getCell('G8').value = 445;
  sheet.getCell('H8').value = 0;
  sheet.getCell('I8').value = '99861';
  sheet.getCell('J8').value = 13673.11;
  sheet.getCell('K8').value = 13673.11;
  sheet.getCell('L8').value = 13673.11;

  sheet.getCell('B9').value = 'የሞባይል ቀፎ kl128 GB R4';
  sheet.getCell('C9').value = 'tecno';
  sheet.getCell('D9').value = 'china';
  sheet.getCell('E9').value = 'ዘቁጥር';
  sheet.getCell('F9').value = 0;
  sheet.getCell('G9').value = 488;
  sheet.getCell('H9').value = 0;
  sheet.getCell('I9').value = '99861';
  sheet.getCell('J9').value = 18919.55;
  sheet.getCell('K9').value = 18919.55;
  sheet.getCell('L9').value = 18919.55;

  // Group 2
  sheet.getCell('A10').value = 'ኮድ-7';
  sheet.getCell('B10').value = 'የሞባይል ቀፎ M14 64GB RM4';
  sheet.getCell('C10').value = 'samsung';
  sheet.getCell('D10').value = 'India';
  sheet.getCell('E10').value = 'ዘቁጥር';
  sheet.getCell('F10').value = 0;
  sheet.getCell('G10').value = 110;
  sheet.getCell('H10').value = 0;
  sheet.getCell('I10').value = '99856';
  sheet.getCell('J10').value = 15836.74;
  sheet.getCell('K10').value = 15836.74;
  sheet.getCell('L10').value = 15836.74;

  // Column widths
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 35;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 10;
  sheet.getColumn(6).width = 10;
  sheet.getColumn(7).width = 10;
  sheet.getColumn(8).width = 10;
  sheet.getColumn(9).width = 15;
  sheet.getColumn(10).width = 15;
  sheet.getColumn(11).width = 15;
  sheet.getColumn(12).width = 15;

  await workbook.xlsx.writeFile('c:\\Users\\Oumer\\Desktop\\auction\\Tender_Formatted.xlsx');
  console.log('✓ Created Tender_Formatted.xlsx');
}

createFormattedExcel().catch(console.error);
