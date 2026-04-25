## SOLUTION: Word Template Issue

The problem is that Word is fragmenting the `{{variable}}` tags across multiple XML elements when you type them, causing "duplicate open/close tag" errors.

### Quick Fix - Manual Steps:

1. **Open Word** and create a NEW blank document
2. **Type the letter content** but use PLACEHOLDERS like `TENDER_NUMBER` instead of `{{tenderNumber}}`
3. **Save the document** as `LASTWINNERLETTER_TEMP.docx`
4. **Close Word completely**
5. **Run the replacement script** below to convert placeholders to proper tags

### Automated Fix Script:

Save this as `fix-word-template-final.js`:

\`\`\`javascript
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

// This script converts PLACEHOLDER text to {{variable}} format
// in a way that doesn't fragment the XML

const templatePath = path.join(__dirname, 'LASTWINNERLETTER_TEMP.docx');
const outputPath = path.join(__dirname, 'LASTWINNERLETTER.docx');

const replacements = {
  'TENDER_NUMBER': 'tenderNumber',
  'DATE': 'date',
  'WINNER_NAME': 'winnerName',
  'GROUP_CODE': 'groupCode',
  'ITEM_DESCRIPTION': 'itemDescription',
  'WINNER_PRICE': 'winnerPrice',
  'CALC_70': 'calc70',
  'CALC_30': 'calc30',
  'VAT': 'vat',
  'TOTAL_WITH_VAT': 'totalWithVAT'
};

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  let documentXml = zip.files['word/document.xml'].asText();
  
  // Replace each placeholder with proper template syntax
  for (const [placeholder, variable] of Object.entries(replacements)) {
    const regex = new RegExp(placeholder, 'g');
    documentXml = documentXml.replace(regex, `{{${variable}}}`);
  }
  
  zip.file('word/document.xml', documentXml);
  
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log('✅ Template fixed and saved to LASTWINNERLETTER.docx');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\\nMake sure LASTWINNERLETTER_TEMP.docx exists!');
}
\`\`\`

### Alternative: Use the Excel Template Instead

Since the Excel template is working, you can focus on testing that first:

\`\`\`bash
node test-excel-upload.js
\`\`\`

The Word template for winner letters is a separate feature that can be fixed later.

### Summary:

- **Excel Template**: Should work now (test with the script above)
- **Word Template**: Needs manual recreation with placeholders, then automated conversion
- **Root Cause**: Word's XML fragmentation of curly braces

Would you like me to help test the Excel template first, or create a simple Word template with placeholders for you?
