const ExcelJS = require('exceljs');

async function createFormattedExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tender Data');

  // Tender-level metadata (rows 1-6)
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

  // Empty row 7

  // Header row (row 8)
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
    const cell = sheet.getCell(8, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
  });

  // Data rows starting from row 9
  const data = [
    // Group ኮድ-32
    ['ኮድ-32', 'የምግብ ዘይት ባለ20L', 'OMAAR', 'S.land', 'በጀርካን', 25, 0, 0, '100548', 25, 26, 24],
    ['', 'የምግብ ዘይት ባለ3L', 'HAYAT', 'S.land', 'በቁጥር', 11, 0, 0, '100548', 25, 26, 24],
    ['', 'ሩዝ ባለ25 kg', 'ppp', 'India', 'በከረጢት', 6, 0, 0, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'OMAAR', 'India', 'በከረጢት', 18, 0, 0, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'fssat', 'India', 'በከረጢት', 11, 0, 0, '100548', 25, 26, 24],
    ['', 'ስካር ባለ25 kg', 'silvor', 'የለዉም', 'በከረጢት', 1, 0, 0, '100458', 25, 26, 24],
    ['', 'ስካር ባለ50 kg', 'fssat', 'India', 'በከረጢት', 4, 0, 0, '100458', 25, 26, 24],
    ['', 'የዳቦ ዱቄት ባለ25 kg', 'የለዉም', 'egypt', 'በከረጢት', 7, 0, 0, '100549', 25, 26, 24],
    ['', 'ሰርዲር 48×95g', 'OMAAR', 'Thailand', 'በካርቶን', 16, 0, 0, '52253', 25, 26, 24],
    ['', 'አናናስ 12×565g', 'bader', 'Thailand', 'በካርቶን', 1, 0, 0, '52252', 25, 26, 24],
    ['', 'የአትክልት ቅቤ 09.kg', 'sheno', 'yemen', 'በቁጥር', 47, 0, 0, '52253', 25, 26, 24],
    
    // Group ኮድ-33
    ['ኮድ-33', 'ብስኩት 1×24pcs×120g', 'Shirinasal', 'iran', 'በካርቶን', 3, 0, 0, '52253', 25, 24, 23],
    ['', 'ብስኩት 24pcs×150gram', 'deemah', 'S.land', 'በካረቶን', 6, 0, 0, '52253', 25, 24, 23],
    ['', 'Abululad 48×90gram', 'teashop', 'yemen', 'በካርቶን', 6, 0, 0, '52253', 25, 24, 23],
    ['', 'ፓስታ 20×500gram', 'parlin', 'oman', 'በካርቶን', 12, 0, 0, '52253', 25, 24, 23],
    ['', 'ድፍን ምስር 15kg', 'mellow', 'uae', 'በከረጢት', 5, 0, 0, '52253', 25, 24, 23],
    ['', 'ፓስታ 20×500gram', 'mutulu', 'turkey', 'በካርቶ', 6, 0, 0, '52253', 25, 24, 23],
    ['', 'ቴምር 5kg', 'saad', 'uae', 'በካርቶን', 5, 0, 0, '52253', 25, 24, 23],
    ['', 'ማስቲካ 250g/20paket', 'banana', 'vietnam', 'በእሽግ', 22, 0, 0, '52253', 25, 24, 23],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'Bubblegum', 'India', 'በእሽግ', 277, 0, 0, '52278', 25, 24, 23],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'lollypop', 'India', 'በእሽግ', 18, 0, 0, '52278', 25, 24, 23],
    ['', 'ቸኮሌት 105pcs 472gram', 'Happy caw', 'India', 'በእሽግ', 38, 0, 0, '52278', 25, 24, 23],
    
    // Group ኮድ-34
    ['ኮድ-34', 'ባለ እንጨት ከረሜላ 48pcs', 'bon bon', 'India', 'በእሽግ', 37, 0, 0, '52278', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 100gram', 'big', 'India', 'በእሽግ', 397, 0, 0, '52278', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'bigbll', 'India', 'በእሽግ', 507, 0, 0, '52279', 22, 23, 24],
    ['', 'ባለ እንጨት ከረሜላ 50pcs', 'bigboII', 'India', 'በእሽግ', 339, 0, 0, '52279', 22, 23, 24],
    ['', 'ዘይቱና ጁስ 250ml', 'faragello', 'egypt', 'በቁጥር', 93, 0, 0, '52252', 22, 23, 24],
    ['', 'ሰርዲን 95gram', 'ommar', 'thailand', 'በቁጥር', 226, 0, 0, '52257', 22, 23, 24],
    ['', 'ፓስታ 500g', 'mututu', 'turkey', 'በቁጥር', 675, 0, 0, '52278', 22, 23, 24],
    ['', 'ቴምር 1KG', 'almadina', 'የለዉም', 'በእሽግ', 35, 0, 0, '52279', 22, 23, 24],
    ['', 'white otatr 400g', 'royal', 'uae', 'በቁጥር', 74, 0, 0, '52258', 22, 23, 24],
    ['', 'natural oats 400g', 'rino', 'uae', 'በቁጥር', 24, 0, 0, '52258', 22, 23, 24],
    ['', 'Crimla chocolat 48pcs', 'fun2', 'India', 'በፓኬት', 45, 0, 0, '52277', 22, 23, 24]
  ];

  let row = 9;
  data.forEach(rowData => {
    rowData.forEach((value, colIndex) => {
      sheet.getCell(row, colIndex + 1).value = value;
    });
    row++;
  });

  // Column widths
  sheet.getColumn(1).width = 12;
  sheet.getColumn(2).width = 35;
  sheet.getColumn(3).width = 15;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 12;
  sheet.getColumn(6).width = 10;
  sheet.getColumn(7).width = 10;
  sheet.getColumn(8).width = 10;
  sheet.getColumn(9).width = 15;
  sheet.getColumn(10).width = 15;
  sheet.getColumn(11).width = 15;
  sheet.getColumn(12).width = 15;

  await workbook.xlsx.writeFile('c:\\Users\\Oumer\\Desktop\\auction\\Tender_033_2018_Formatted.xlsx');
  console.log('✓ Created Tender_033_2018_Formatted.xlsx');
}

createFormattedExcel().catch(console.error);
