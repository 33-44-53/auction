const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'LASTWINNERLETTER.docx');

console.log('🔍 Analyzing Word Template for Tag Issues\n');
console.log(`Template: ${templatePath}\n`);

try {
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  // Extract document.xml to check raw tags
  const documentXml = zip.files['word/document.xml'].asText();
  
  console.log('📋 Searching for all {{ and }} tags...\n');
  
  // Find all opening tags
  const openTags = documentXml.match(/\{\{/g) || [];
  const closeTags = documentXml.match(/\}\}/g) || [];
  
  console.log(`Found ${openTags.length} opening tags ({{)`);
  console.log(`Found ${closeTags.length} closing tags (}})\n`);
  
  if (openTags.length !== closeTags.length) {
    console.log('⚠️  WARNING: Mismatch between opening and closing tags!\n');
  }
  
  // Extract all complete tags
  const tagPattern = /\{\{[^}]*\}\}/g;
  const tags = documentXml.match(tagPattern) || [];
  
  console.log(`✅ Complete tags found: ${tags.length}`);
  const uniqueTags = [...new Set(tags)];
  console.log('\nUnique tags:');
  uniqueTags.forEach(tag => console.log(`  - ${tag}`));
  
  // Check for broken tags ({{ without matching }})
  console.log('\n🔍 Checking for broken/duplicate tags...\n');
  
  // Find positions of all {{ and }}
  let pos = 0;
  const openPositions = [];
  const closePositions = [];
  
  while ((pos = documentXml.indexOf('{{', pos)) !== -1) {
    openPositions.push(pos);
    pos += 2;
  }
  
  pos = 0;
  while ((pos = documentXml.indexOf('}}', pos)) !== -1) {
    closePositions.push(pos);
    pos += 2;
  }
  
  // Check for duplicate opens
  for (let i = 0; i < openPositions.length - 1; i++) {
    const nextOpen = openPositions[i + 1];
    const nextClose = closePositions.find(c => c > openPositions[i]);
    
    if (nextClose && nextOpen < nextClose) {
      const snippet = documentXml.substring(openPositions[i], nextOpen + 20);
      console.log(`❌ DUPLICATE OPEN TAG at position ${openPositions[i]}:`);
      console.log(`   Context: ${snippet.substring(0, 100)}...\n`);
    }
  }
  
  // Try to compile with docxtemplater
  console.log('\n🧪 Testing with Docxtemplater...\n');
  
  try {
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    console.log('✅ Template is valid!\n');
    console.log('📝 Expected variables:');
    const tags = doc.getFullText().match(/\{\{[^}]+\}\}/g) || [];
    const vars = [...new Set(tags.map(t => t.replace(/[{}]/g, '')))];
    vars.forEach(v => console.log(`  - ${v}`));
    
  } catch (error) {
    console.log('❌ Template validation failed!\n');
    console.log('Error:', error.message);
    
    if (error.properties) {
      console.log('\nError details:');
      console.log(JSON.stringify(error.properties, null, 2));
    }
  }
  
} catch (error) {
  console.error('❌ Failed to read template:', error.message);
  process.exit(1);
}
