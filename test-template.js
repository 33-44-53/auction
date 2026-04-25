const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER.docx');

console.log('Template path:', templatePath);
console.log('Template exists:', fs.existsSync(templatePath));

if (fs.existsSync(templatePath)) {
  try {
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    console.log('Template loaded successfully');
    
    // Test render
    doc.render({
      refNumber: '_______________',
      date: '_______________',
      tenderNumber: 'TEST-001',
      winnerName: 'Test Winner',
      groupCode: 'CODE-10',
      itemDescription: 'Test Items',
      winnerPrice: '100,000.00',
      calc70: '70,000.00',
      calc30: '30,000.00',
      vat: '15,000.00',
      totalWithVAT: '115,000.00'
    });

    console.log('Template rendered successfully!');
    
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync('TEST_OUTPUT.docx', buffer);
    console.log('Test file created: TEST_OUTPUT.docx');
    
  } catch (error) {
    console.error('Template error:', error.message);
    console.error('Full error:', error);
  }
} else {
  console.error('Template file not found!');
}
