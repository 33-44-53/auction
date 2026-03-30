const { parseExcelFile } = require('./src/utils/excelParser');

async function test() {
  try {
    const result = await parseExcelFile('./tender_032_2018_v2.xlsx', null);
    console.log('Parse result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Parse error:', error.message);
  }
}

test();
