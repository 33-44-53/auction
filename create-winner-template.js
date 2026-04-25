const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

console.log('📝 Creating Clean Winner Letter Template\n');

const outputPath = path.join(__dirname, 'LASTWINNERLETTER.docx');
const backupPath = path.join(__dirname, 'LASTWINNERLETTER_OLD.docx');

// Backup existing file if it exists
if (fs.existsSync(outputPath)) {
  console.log('💾 Backing up existing template to LASTWINNERLETTER_OLD.docx');
  fs.copyFileSync(outputPath, backupPath);
}

// Create a minimal valid Word document structure with proper template variables
const createCleanTemplate = () => {
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
  
  // word/document.xml - CRITICAL: Each {{variable}} in a SINGLE <w:t> tag
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t xml:space="preserve">ቁጥር/Ref.No ___________________ ቀን /Date ________________</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን</w:t></w:r></w:p>
    <w:p><w:r><w:t>ጉዳዩ፤ ክፊያ መቀበልን ይመለከታል</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር </w:t></w:r>
      <w:r><w:t>{{tenderNumber}}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> በ </w:t></w:r>
      <w:r><w:t>{{date}}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> ዓ.ም የተካሄደ መሆኑ ይታወቃል። በዚህ መሠረት አቶ </w:t></w:r>
      <w:r><w:t>{{winnerName}}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> በ </w:t></w:r>
      <w:r><w:t>{{groupCode}}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> </w:t></w:r>
      <w:r><w:t>{{itemDescription}}</w:t></w:r>
      <w:r><w:t xml:space="preserve"> በብር </w:t></w:r>
      <w:r><w:t>{{winnerPrice}}</w:t></w:r>
      <w:r><w:t> ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">70% ---------------------------------------------------- </w:t></w:r>
      <w:r><w:t>{{calc70}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">30% ---------------------------------------------------- </w:t></w:r>
      <w:r><w:t>{{calc30}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">15% (ቫት) ------------------------------------------------- </w:t></w:r>
      <w:r><w:t>{{vat}}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">ጠቅላላ ድምር ------------------------------------------- </w:t></w:r>
      <w:r><w:t>{{totalWithVAT}}</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውንት ቁጥር 1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ደብዳቤው ተዘጋጅቷል።</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:t>‹‹ከሰላምታ ጋር››</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p>
      <w:r><w:t xml:space="preserve">አሸናፊ: </w:t></w:r>
      <w:r><w:t>{{winnerName}}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
  
  zip.file('word/document.xml', documentXml);
  
  return zip;
};

try {
  console.log('🔨 Building template structure...');
  const zip = createCleanTemplate();
  
  console.log('💾 Generating .docx file...');
  const buf = zip.generate({ type: 'nodebuffer' });
  fs.writeFileSync(outputPath, buf);
  
  console.log(`✅ Template created: ${outputPath}\n`);
  
  // Test the template
  console.log('🧪 Testing template...\n');
  
  const Docxtemplater = require('docxtemplater');
  const testContent = fs.readFileSync(outputPath, 'binary');
  const testZip = new PizZip(testContent);
  
  const doc = new Docxtemplater(testZip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  
  doc.render({
    tenderNumber: 'TND-2024-001',
    date: '15/01/2024',
    winnerName: 'አቶ ተስፋዬ መንግስቱ',
    groupCode: 'ኮድ-10',
    itemDescription: 'የሞባይል ቀፎ እና መለዋወጫዎች',
    winnerPrice: '1,250,000.00',
    calc70: '875,000.00',
    calc30: '375,000.00',
    vat: '187,500.00',
    totalWithVAT: '1,437,500.00'
  });
  
  console.log('✅ Template is VALID and WORKING!\n');
  console.log('📝 Template variables:');
  console.log('  - {{tenderNumber}}');
  console.log('  - {{date}}');
  console.log('  - {{winnerName}}');
  console.log('  - {{groupCode}}');
  console.log('  - {{itemDescription}}');
  console.log('  - {{winnerPrice}}');
  console.log('  - {{calc70}}');
  console.log('  - {{calc30}}');
  console.log('  - {{vat}}');
  console.log('  - {{totalWithVAT}}');
  
  console.log('\n✅ SUCCESS! Template is ready to use.');
  console.log('\n📌 Next steps:');
  console.log('1. Test winner letter export in your application');
  console.log('2. Go to a SOLD group and export winner letter');
  console.log('3. If you want to add letterhead, open in Word, add it, and save\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
