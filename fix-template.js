const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER.docx');
const outputPath = path.join(__dirname, 'LASTWINNERLETTER_FIXED.docx');

console.log('🔧 Fixing Word Template - Converting {var} to {{var}}\n');

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  let documentXml = zip.files['word/document.xml'].asText();
  
  console.log('📋 Found variables to fix:');
  const variables = [
    'tenderNumber',
    'date',
    'winnerName',
    'groupCode',
    'itemDescription',
    'winnerPrice',
    'calc70',
    'calc30',
    'vat',
    'totalWithVAT'
  ];
  
  variables.forEach(varName => {
    const singleBrace = `{${varName}}`;
    const doubleBrace = `{{${varName}}}`;
    
    if (documentXml.includes(singleBrace)) {
      console.log(`  ✓ Converting {${varName}} → {{${varName}}}`);
      documentXml = documentXml.replace(new RegExp(`\\{${varName}\\}`, 'g'), doubleBrace);
    }
  });
  
  // Update the document.xml in the zip
  zip.file('word/document.xml', documentXml);
  
  // Generate the new docx file
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log(`\n✅ Fixed template saved to: ${outputPath}`);
  console.log('\n📝 Next steps:');
  console.log('1. Delete or rename the old LASTWINNERLETTER.docx');
  console.log('2. Rename LASTWINNERLETTER_FIXED.docx to LASTWINNERLETTER.docx');
  console.log('3. Test the template again\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
