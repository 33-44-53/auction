const { parseExcelFile } = require('./src/utils/excelParser');
const path = require('path');

async function testExcelUpload() {
  console.log('🧪 Testing Excel Upload with Fixed Template\n');
  
  const templatePath = path.join(__dirname, 'Tender_Template_ItemExchangeRate.xlsx');
  
  try {
    console.log(`📄 Testing file: ${templatePath}\n`);
    
    const result = await parseExcelFile(templatePath, 'test-tender-id');
    
    console.log('\n✅ PARSING SUCCESSFUL!\n');
    console.log('📊 Results Summary:');
    console.log('==================');
    console.log(`Total Groups: ${result.groups.length}`);
    console.log(`Total Items: ${result.groups.reduce((sum, g) => sum + g.items.length, 0)}`);
    
    console.log('\n📋 Tender Metadata:');
    console.log(JSON.stringify(result.tenderMeta, null, 2));
    
    console.log('\n📦 Groups:');
    result.groups.forEach((group, idx) => {
      console.log(`\n  Group ${idx + 1}: ${group.code} - ${group.name}`);
      console.log(`  Items: ${group.items.length}`);
      console.log(`  Metadata:`, group.metadata);
      
      if (group.items.length > 0) {
        console.log(`\n  Sample Item (first):`);
        const item = group.items[0];
        console.log(`    - Name: ${item.name}`);
        console.log(`    - Code: ${item.itemCode}`);
        console.log(`    - Quantity: ${item.totalQuantity} (WH1:${item.warehouse1}, WH2:${item.warehouse2}, WH3:${item.warehouse3})`);
        console.log(`    - Prices: FOB=${item.fob}, CIF=${item.cif}, TAX=${item.tax}`);
        console.log(`    - Exchange Rate: ${item.exchangeRate || 'Not set'}`);
        console.log(`    - Expire Date: ${item.expireDate || 'Not set'}`);
      }
    });
    
    console.log('\n\n✅ TEST PASSED - Template is correctly formatted!');
    console.log('You can now upload this template through the frontend.\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testExcelUpload();
