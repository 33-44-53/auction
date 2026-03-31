const { parseExcelFile } = require('./src/utils/excelParser');

// Test with your Excel file
const filePath = './Tender_3_Groups.xlsx';

parseExcelFile(filePath, null)
  .then(result => {
    console.log('\n=== PARSE RESULT ===');
    console.log('Groups:', result.groups.length);
    console.log('\nFirst group:');
    console.log('Code:', result.groups[0].code);
    console.log('Name:', result.groups[0].name);
    console.log('Items:', result.groups[0].items.length);
    console.log('\nFirst item:');
    const item = result.groups[0].items[0];
    console.log('Name:', item.name);
    console.log('Warehouse1:', item.warehouse1);
    console.log('Warehouse2:', item.warehouse2);
    console.log('Warehouse3:', item.warehouse3);
    console.log('Total Quantity:', item.totalQuantity);
    console.log('\n===================');
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
