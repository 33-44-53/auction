const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

console.log('🔧 Converting Winner Letter Template\n');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER_TEMP.docx');
const outputPath = path.join(__dirname, 'LASTWINNERLETTER.docx');

// Check if temp file exists
if (!fs.existsSync(templatePath)) {
  console.error('❌ Error: LASTWINNERLETTER_TEMP.docx not found!');
  console.error('\nPlease follow these steps:');
  console.error('1. Open Microsoft Word');
  console.error('2. Create a new document with the letter content');
  console.error('3. Use PLACEHOLDERS (see TEMPLATE_INSTRUCTIONS.md)');
  console.error('4. Save as LASTWINNERLETTER_TEMP.docx');
  console.error('5. Close Word completely');
  console.error('6. Run this script again\n');
  process.exit(1);
}

try {
  console.log('📄 Reading template file...');
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  let documentXml = zip.files['word/document.xml'].asText();
  
  console.log('🔄 Converting placeholders to template variables...\n');
  
  // Define all replacements
  const replacements = {
    'TENDER_NUMBER': 'tenderNumber',
    'DATE_VALUE': 'date',
    'WINNER_NAME': 'winnerName',
    'GROUP_CODE': 'groupCode',
    'ITEM_DESCRIPTION': 'itemDescription',
    'WINNER_PRICE': 'winnerPrice',
    'CALC_70': 'calc70',
    'CALC_30': 'calc30',
    'VAT_VALUE': 'vat',
    'TOTAL_WITH_VAT': 'totalWithVAT'
  };
  
  // Replace each placeholder with proper template syntax
  let replacedCount = 0;
  for (const [placeholder, variable] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder, 'g');
    const matches = documentXml.match(regex);
    if (matches) {
      console.log(`  ✓ Converting ${placeholder} → {{${variable}}} (${matches.length} occurrence(s))`);
      documentXml = documentXml.replace(regex, `{{${variable}}}`);
      replacedCount += matches.length;
    } else {
      console.log(`  ⚠ Warning: ${placeholder} not found in document`);
    }
  }
  
  console.log(`\n📊 Total replacements: ${replacedCount}`);
  
  // Update the document.xml in the zip
  zip.file('word/document.xml', documentXml);
  
  // Generate the new docx file
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log(`\n✅ Template saved to: ${outputPath}`);
  
  // Test the template
  console.log('\n🧪 Testing template with Docxtemplater...\n');
  
  try {
    const testContent = fs.readFileSync(outputPath, 'binary');
    const testZip = new PizZip(testContent);
    const doc = new Docxtemplater(testZip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Try to render with sample data
    doc.render({
      tenderNumber: 'TEST-001',
      date: '01/01/2024',
      winnerName: 'Test Winner',
      groupCode: 'ኮድ-10',
      itemDescription: 'Test Items',
      winnerPrice: '100,000.00',
      calc70: '70,000.00',
      calc30: '30,000.00',
      vat: '15,000.00',
      totalWithVAT: '115,000.00'
    });
    
    console.log('✅ Template is valid and working!\n');
    console.log('📝 Variables found and working:');
    Object.keys(replacements).forEach(key => {
      console.log(`  - {{${replacements[key]}}}`);
    });
    
    console.log('\n✅ SUCCESS! Template is ready to use.');
    console.log('\n📌 Next steps:');
    console.log('1. You can delete LASTWINNERLETTER_TEMP.docx (optional)');
    console.log('2. Test the winner letter export in your application');
    console.log('3. Go to a SOLD group and click "Export Winner Letter"\n');
    
  } catch (testError) {
    console.error('\n❌ Template validation failed!');
    console.error('Error:', testError.message);
    
    if (testError.properties && testError.properties.errors) {
      console.error('\nDetailed errors:');
      testError.properties.errors.slice(0, 5).forEach((err, i) => {
        console.error(`${i + 1}. ${err.message}`);
        if (err.properties) {
          console.error(`   Context: ${err.properties.xtag || err.properties.context}`);
        }
      });
    }
    
    console.error('\n💡 This might mean:');
    console.error('- Word still fragmented some text');
    console.error('- Try recreating the template with simpler formatting');
    console.error('- Or use the fallback (system creates letter from scratch)\n');
  }
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
