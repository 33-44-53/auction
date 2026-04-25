const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

// Create a minimal valid Word document structure
const createMinimalDocx = () => {
  const zip = new PizZip();
  
  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  
  // _rels/.rels
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  
  // word/_rels/document.xml.rels
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);
  
  // word/document.xml with the letter content
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>ቁጥር/Ref.No ___________________ ቀን /Date ________________</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን</w:t></w:r></w:p>
    <w:p><w:r><w:t>ጉዳዩ፤ ክፊያ መቀበልን ይመለከታል</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {{tenderNumber}} በ {{date}} ዓ.ም የተካሄደ መሆኑ ይታወቃል። በዚህ መሠረት አቶ {{winnerName}} በ {{groupCode}} {{itemDescription}} በብር {{winnerPrice}} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>70% ---------------------------------------------------- {{calc70}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>30% ---------------------------------------------------- {{calc30}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>15% (ቫት) ------------------------------------------------- {{vat}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>ጠቅላላ ድምር ------------------------------------------- {{totalWithVAT}}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውንት ቁጥር 1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ደብዳቤው ተዘጋጅቷል።</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>አሸናፊ: {{winnerName}}</w:t></w:r></w:p>
  </w:body>
</w:document>`;
  
  zip.file('word/document.xml', documentXml);
  
  return zip;
};

console.log('📝 Creating clean Word template from scratch...\n');

try {
  const zip = createMinimalDocx();
  const outputPath = path.join(__dirname, 'LASTWINNERLETTER_NEW.docx');
  
  // Generate the docx file
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log(`✅ New template created: ${outputPath}\n`);
  
  // Test it
  console.log('🧪 Testing new template...\n');
  const testContent = fs.readFileSync(outputPath, 'binary');
  const testZip = new PizZip(testContent);
  
  const doc = new Docxtemplater(testZip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  
  console.log('✅ Template is valid!\n');
  console.log('📝 Variables found:');
  const text = doc.getFullText();
  const vars = [...new Set(text.match(/\{\{[^}]+\}\}/g) || [])];
  vars.forEach(v => console.log(`  - ${v}`));
  
  console.log('\n✅ SUCCESS! Use this template:');
  console.log('   LASTWINNERLETTER_NEW.docx\n');
  console.log('To replace the old one:');
  console.log('   del LASTWINNERLETTER.docx');
  console.log('   ren LASTWINNERLETTER_NEW.docx LASTWINNERLETTER.docx\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
