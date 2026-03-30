const XLSX = require('xlsx');

const workbook = XLSX.readFile('./tender_032_2018_v2.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });

console.log('Raw data rows:');
rawData.forEach((row, i) => {
  console.log(`Row ${i}:`, row);
});

console.log('\n\nLooking for header row...');
const keywords = ['code', 'item', 'name', 'qty', 'quantity', 'fob', 'cif', 'tax',
  'unit', 'brand', 'country', 'warehouse', 'ኮድ', 'ዕቃ', 'አሃድ', 'መጋዘን'];

for (let i = 0; i < rawData.length; i++) {
  const row = rawData[i];
  if (!row || row.length < 3) continue;
  const matches = row.filter(cell => {
    const s = String(cell || '').trim().toLowerCase();
    return s && keywords.some(k => s.includes(k));
  });
  if (matches.length >= 2) {
    console.log(`Found header at row ${i}:`, row);
    console.log('Matches:', matches);
    break;
  }
}
