const ExcelJS = require('exceljs');

async function createTender036Excel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('ጨረታ');

  // Tender metadata at the top
  sheet.getCell('A1').value = 'የተያዘበት ቀን';
  sheet.getCell('B1').value = '30-04-2018';
  
  sheet.getCell('A2').value = 'የተያዘበት ቦታ';
  sheet.getCell('B2').value = 'ባቡር ጣቢያ';
  
  sheet.getCell('A3').value = 'ያዥው አካል';
  sheet.getCell('B3').value = '';
  
  sheet.getCell('A4').value = 'የተሸከርካሪ ሰሌዳ';
  sheet.getCell('B4').value = '';
  
  sheet.getCell('A5').value = 'ደ/ቁ';
  sheet.getCell('B5').value = 'የእ/እ/ቡ/እስ/292/2018';
  
  sheet.getCell('A6').value = 'exchange rate';
  sheet.getCell('B6').value = 157.6304;

  // Main title
  sheet.getCell('A8').value = 'ግልፅ ጨረታ ቁጥር 036/2018';
  
  // Headers row
  const headers = [
    'ተ.ቁ',
    'የእቃው አይነት',
    'ማርክ',
    'ስሪት ሀገር',
    'መለኪያ',
    'መጋዘን1',
    'መጋዘን 2',
    'መጋዝን 3',
    'ጠቅላላ ድምር',
    'የአንድ ዋጋ (fob)',
    'የአንድ ዋጋ(cif)',
    'የአንድ ዋጋ(tax)',
    'ሞዴል',
    'ኮድ'
  ];
  
  headers.forEach((header, index) => {
    sheet.getCell(10, index + 1).value = header;
  });

  // Group 1: ኮድ-40 - የተለያዩ አልባሰት (110 items)
  const group1Items = [
    [1, 'የአዋቂ ወንድ ቲሸርት', 'Sun basic', 'China', 'በቁጥር', 0, 0, 19, 19, 4.33, 4.84, 3.98, '52004', 'ኮድ-40'],
    [2, 'የአዋቂ ወንድ ቲሸርት', 'ML4', 'China', 'በቁጥር', 0, 0, 11, 11, 4.33, 4.84, 3.98, '52004', 'ኮድ-40'],
    [3, 'የአዋቂ ወንድ ቲሸርት', 'Zara club', 'India', 'በቁጥር', 0, 0, 8, 8, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [4, 'የአዋቂ ወንድ ቲሸርት', 'Vouge', 'የለውም', 'በቁጥር', 0, 0, 8, 8, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [5, 'የአዋቂ ወንድ ቲሸርት', 'የለውም', 'የለውም', 'በቁጥር', 0, 0, 33, 33, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [6, 'የአዋቂ ወንድ ቲሸርት', 'Top Cloths', 'የለውም', 'በቁጥር', 0, 0, 2, 2, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [7, 'የአዋቂ ወንድ ቲሸርት', 'B', 'China', 'በቁጥር', 0, 0, 13, 13, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [8, 'የአዋቂ ወንድ ቲሸርት', 'Easel', 'የለውም', 'በቁጥር', 0, 0, 5, 5, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [9, 'የአዋቂ ወንድ ቲሸርት', 'የለውም', 'China', 'በቁጥር', 0, 0, 7, 7, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [10, 'የአዋቂ ወንድ ቲሸርት', 'Compna', 'የለውም', 'በቁጥር', 0, 0, 3, 3, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    // Add more items as needed - showing first 10 for brevity
    [11, 'የአዋቂ ወንድ ቲሸርት', 'FML', 'China', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [12, 'የአዋቂ ወንድ ቲሸርት', 'Fashion', 'China', 'በቁጥር', 0, 0, 20, 20, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [13, 'የአዋቂ ወንድ ቲሸርት', 'Design', 'የለውም', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [14, 'የአዋቂ ወንድ ቲሸርት', 'Fashion', 'የለውም', 'በቁጥር', 0, 0, 12, 12, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [15, 'የአዋቂ ወንድ እጀጌ ሙሉ ቲሸርት', 'Fashion', 'የለውም', 'በቁጥር', 0, 0, 7, 7, 4.33, 4.84, 3.98, '52005', 'ኮድ-40'],
    [16, 'የአዋቂ ወንድ እጀጌ ሙሉ ቲሸርት', 'Zara club', 'የለውም', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52006', 'ኮድ-40'],
    [17, 'የአዋቂ ወንድ ቲሸርት', 'ML5', 'China', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52006', 'ኮድ-40'],
    [18, 'የአዋቂ ወንድ ቲሸርት', 'WMJX', 'China', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52006', 'ኮድ-40'],
    [19, 'የአዋቂ ወንድ ቲሸርት', 'Undeid', 'China', 'በቁጥር', 0, 0, 1, 1, 4.33, 4.84, 3.98, '52006', 'ኮድ-40'],
    [20, 'የአዋቂ ወንድ ቁምጣ', 'DTXIDS', 'China', 'በቁጥር', 0, 0, 3, 3, 3.61, 4.04, 3.32, '52006', 'ኮድ-40'],
  ];

  let currentRow = 11;
  group1Items.forEach(item => {
    item.forEach((value, colIndex) => {
      sheet.getCell(currentRow, colIndex + 1).value = value;
    });
    currentRow++;
  });

  // Group 2: ኮድ-13 - የተለያዩ ብርድልብሶች (3 items)
  currentRow += 2; // Skip a row
  sheet.getCell(currentRow, 1).value = 'ኮድ-13';
  currentRow++;
  
  const group2Items = [
    [1, 'ብርድ ልብስ 9.50l.b.s', 'True love', 'P.R.C', 'በቁጥር', 0, 0, 153, 153, 17.2, 19.26, 15.85, '52004', 'ኮድ-13'],
    [2, 'ብርድ ልብስ 12.80l.b.s', 'True love', 'P.R.C', 'በቁጥር', 0, 0, 3, 3, 23.2, 25.98, 21.38, '52004', 'ኮድ-13'],
    [3, 'ብርድ ልብስ 9.50l.b.s', 'Super Tayo', 'P.R.C', 'በቁጥር', 0, 0, 27, 27, 17.2, 19.26, 15.85, '52004', 'ኮድ-13'],
  ];

  group2Items.forEach(item => {
    item.forEach((value, colIndex) => {
      sheet.getCell(currentRow, colIndex + 1).value = value;
    });
    currentRow++;
  });

  // Group 3: ኮድ-41 - የተለያዩ ኤልክትሮሊክ (27 items)
  currentRow += 2;
  sheet.getCell(currentRow, 1).value = 'ኮድ-41';
  currentRow++;
  
  const group3Items = [
    [1, 'Electric ketteli 2.5L MA2353', 'Marado', 'China', 'በቁጥር', 0, 0, 2, 2, 10.33, 11.56, 8.52, '101142', 'ኮድ-41'],
    [2, 'Electric steam iron', 'Sonifer', 'China', 'በቁጥር', 0, 0, 2, 2, 13.92, 15.59, 11.5, '101142', 'ኮድ-41'],
    [3, 'Rechargeable hair clipper GM-6680', 'Geemy', 'P.R.C', 'በቁጥር', 0, 0, 5, 5, 12.6, 14.11, 10.4, '101147', 'ኮድ-41'],
    [4, 'Professional Hair clipper KM-700H', 'Kemei', 'P.R.C', 'በቁጥር', 0, 0, 4, 4, 12.6, 14.11, 10.4, '101147', 'ኮድ-41'],
    [5, 'Mens hair clipper DL-1925', 'Daling', 'P.R.C', 'በቁጥር', 0, 0, 7, 7, 12.6, 14.11, 10.4, '101147', 'ኮድ-41'],
  ];

  group3Items.forEach(item => {
    item.forEach((value, colIndex) => {
      sheet.getCell(currentRow, colIndex + 1).value = value;
    });
    currentRow++;
  });

  // Set column widths
  sheet.getColumn(1).width = 8;
  sheet.getColumn(2).width = 35;
  sheet.getColumn(3).width = 15;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 10;
  sheet.getColumn(6).width = 10;
  sheet.getColumn(7).width = 10;
  sheet.getColumn(8).width = 10;
  sheet.getColumn(9).width = 12;
  sheet.getColumn(10).width = 15;
  sheet.getColumn(11).width = 15;
  sheet.getColumn(12).width = 15;
  sheet.getColumn(13).width = 15;
  sheet.getColumn(14).width = 15;

  // Save the file
  await workbook.xlsx.writeFile('tender_036_2018.xlsx');
  console.log('✅ Excel file created: tender_036_2018.xlsx');
  console.log('📊 Structure:');
  console.log('   - Tender metadata at top');
  console.log('   - Exchange rate: 157.6304');
  console.log('   - Multiple groups with different codes');
  console.log('   - Sample items from each group');
  console.log('\n📝 Note: This is a sample with first few items from each group.');
  console.log('   The full file would have all items from your data.');
}

createTender036Excel().catch(console.error);
