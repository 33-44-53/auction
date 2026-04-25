const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER.docx');
const outputPath = path.join(__dirname, 'LASTWINNERLETTER_CLEAN.docx');

console.log('🔧 Fixing Word Template - Cleaning XML Fragmentation\n');

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  let documentXml = zip.files['word/document.xml'].asText();
  
  console.log('📋 Cleaning fragmented tags...\n');
  
  // Remove all formatting tags between curly braces to merge them
  // This regex finds {{ ... }} patterns and removes any XML tags inside
  documentXml = documentXml.replace(/(\{\{)([^}]*?)(\}\})/g, (match, open, content, close) => {
    // Remove all XML tags from the content
    const cleanContent = content.replace(/<[^>]+>/g, '');
    return open + cleanContent + close;
  });
  
  // Also handle cases where {{ or }} themselves are split
  // Pattern: <w:t>{{</w:t><w:t>variable</w:t><w:t>}}</w:t>
  // We need to merge consecutive <w:t> tags
  documentXml = documentXml.replace(/(<w:t[^>]*>)([^<]*)<\/w:t>\s*<w:t[^>]*>([^<]*)<\/w:t>/g, (match, openTag, text1, text2) => {
    return openTag + text1 + text2 + '</w:t>';
  });
  
  // Repeat the merge process multiple times to handle deeply nested cases
  for (let i = 0; i < 5; i++) {
    documentXml = documentXml.replace(/(<w:t[^>]*>)([^<]*)<\/w:t>\s*<w:t[^>]*>([^<]*)<\/w:t>/g, (match, openTag, text1, text2) => {
      return openTag + text1 + text2 + '</w:t>';
    });
  }
  
  // Update the document.xml in the zip
  zip.file('word/document.xml', documentXml);
  
  // Generate the new docx file
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log(`✅ Cleaned template saved to: ${outputPath}\n`);
  
  // Test the cleaned template
  console.log('🧪 Testing cleaned template...\n');
  const testContent = fs.readFileSync(outputPath, 'binary');
  const testZip = new PizZip(testContent);
  
  const Docxtemplater = require('docxtemplater');
  try {
    const doc = new Docxtemplater(testZip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    console.log('✅ Template is now valid!\n');
    console.log('📝 Next step: Replace the old file');
    console.log('   del LASTWINNERLETTER.docx');
    console.log('   ren LASTWINNERLETTER_CLEAN.docx LASTWINNERLETTER.docx\n');
    
  } catch (error) {
    console.log('❌ Template still has issues:', error.message);
    console.log('\n💡 The template needs to be recreated manually in Word.');
    console.log('   Make sure to type each {{variable}} without any formatting changes.\n');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
