const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER.docx');

console.log('📄 Reading Word Template Content\n');

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  const documentXml = zip.files['word/document.xml'].asText();
  
  // Extract text content (simplified)
  const textContent = documentXml
    .replace(/<w:t[^>]*>/g, '')
    .replace(/<\/w:t>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('Document text content (first 1000 chars):\n');
  console.log(textContent.substring(0, 1000));
  console.log('\n...\n');
  
  // Check for any curly braces
  const hasCurly = documentXml.includes('{') || documentXml.includes('}');
  console.log(`\nContains curly braces: ${hasCurly}`);
  
  if (hasCurly) {
    console.log('\n🔍 Found curly braces in document. Searching for patterns...\n');
    
    // Find all text with curly braces
    const textNodes = documentXml.match(/<w:t[^>]*>([^<]*[{}][^<]*)<\/w:t>/g) || [];
    console.log(`Text nodes with curly braces: ${textNodes.length}\n`);
    
    textNodes.slice(0, 20).forEach((node, i) => {
      const text = node.replace(/<[^>]+>/g, '');
      console.log(`${i + 1}. "${text}"`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
