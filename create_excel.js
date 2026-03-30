const XLSX = require('xlsx');

// Create workbook
const wb = XLSX.utils.book_new();

const data = [
  ['ግልፅ ጨረታ ቁጥር 032/2018 የተለያዩ አልባሰት'],
  [],
  ['Tender Number:', '032/2018'],
  ['Title:', 'የተለያዩ አልባሰት'],
  ['Date:', '2018-01-15'],
  ['Location:', 'ድሬዳዋ ጉምሩክ'],
  ['Responsible Body:', 'ድሬዳዋ ጉምሩክ ኮሚሽን'],
  ['Exchange Rate:', '57.5'],
  [],
  ['ኮድ', 'ተ.ቁ', 'የእቃው አይነት', 'ማርክ', 'ስሪት ሀገር', 'መለኪያ', 'መጋዘን 1', 'መጋዘን 2', 'መጋዘን 3', 'ጠቅላላ ድምር', 'የአንድ ዋጋ (FOB)', 'የአንድ ዋጋ (CIF)', 'የአንድ ዋጋ (TAX)', 'ሞዴል'],
  ['47', '1', 'ሺቲ ባለ 30 yds', 'zr503', 'china', 'በጣቃ', 822, 0, 0, 822, 14.31, 26.54, 23.7, '100545'],
  ['', '2', 'ሺቲ ባለ 30 yds', 'ያለውም', 'china', 'በጣቃ', 25, 0, 0, 25, 14.31, 26.54, 23.7, '100545']
];

// Create worksheet
const ws = XLSX.utils.aoa_to_sheet(data);

// Set column widths
ws['!cols'] = [
  { wch: 10 }, // ኮድ
  { wch: 8 },  // ተ.ቁ
  { wch: 25 }, // የእቃው አይነት
  { wch: 15 }, // ማርክ
  { wch: 12 }, // ስሪት ሀገር
  { wch: 10 }, // መለኪያ
  { wch: 12 }, // መጋዘን 1
  { wch: 12 }, // መጋዘን 2
  { wch: 12 }, // መጋዘን 3
  { wch: 15 }, // ጠቅላላ ድምር
  { wch: 15 }, // FOB
  { wch: 15 }, // CIF
  { wch: 15 }, // TAX
  { wch: 15 }  // ሞዴል
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

// Write file
XLSX.writeFile(wb, 'tender_032_2018_v2.xlsx');

console.log('Excel file created: tender_032_2018_v2.xlsx');
console.log('\nData structure:');
console.log('- Tender: 032/2018');
console.log('- Group: ኮድ-47');
console.log('- Items: 2');
console.log('  1. ሺቲ ባለ 30 yds (zr503) - 822 units');
console.log('  2. ሺቲ ባለ 30 yds (ያለውም) - 25 units');
