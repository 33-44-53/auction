const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
const fs = require('fs');

async function createCompleteTemplate() {
  console.log('📝 Creating complete winner letter template with placeholders...\n');
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // Reference Number
        new Paragraph({
          children: [
            new TextRun({
              text: 'ቁጥር/Ref.No: {refNumber}',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 200 }
        }),
        
        // Date
        new Paragraph({
          children: [
            new TextRun({
              text: 'ቀን /Date: {date}',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 400 }
        }),
        
        // Recipient
        new Paragraph({
          children: [
            new TextRun({
              text: 'ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 200 }
        }),
        
        // Subject
        new Paragraph({
          children: [
            new TextRun({
              text: 'ጉዳዩ፤ ',
              font: 'Nyala',
              size: 24,
              bold: true
            }),
            new TextRun({
              text: 'ክፊያ መቀበለን ይመለከታል',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 400 }
        }),
        
        // Body paragraph
        new Paragraph({
          children: [
            new TextRun({
              text: 'በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {tenderNumber} በ{date} ዓ.ም የተካሄደ መሆኑ ይታወቃል። በዚህ መሠረት ስት {winnerName} በኮድ-{groupCode} የተለየዩ {itemDescription} በብር {winnerPrice} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.JUSTIFIED
        }),
        
        // Payment breakdown
        new Paragraph({
          children: [
            new TextRun({ text: '70% ', font: 'Nyala', size: 24, bold: true }),
            new TextRun({ text: '----------------------------------------------------', font: 'Nyala', size: 24 }),
            new TextRun({ text: ' {calc70}', font: 'Nyala', size: 24, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: '30% ', font: 'Nyala', size: 24, bold: true }),
            new TextRun({ text: '----------------------------------------------------', font: 'Nyala', size: 24 }),
            new TextRun({ text: ' {calc30}', font: 'Nyala', size: 24, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: '15% (ቫት) ', font: 'Nyala', size: 24, bold: true }),
            new TextRun({ text: '---------------------------------------------', font: 'Nyala', size: 24 }),
            new TextRun({ text: ' {vat}', font: 'Nyala', size: 24, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: 'ጠቅላላ ድምር ', font: 'Nyala', size: 24, bold: true }),
            new TextRun({ text: '-------------------------------------------', font: 'Nyala', size: 24 }),
            new TextRun({ text: ' {totalWithVAT}', font: 'Nyala', size: 24, bold: true })
          ],
          spacing: { after: 400 }
        }),
        
        // Instructions
        new Paragraph({
          children: [
            new TextRun({
              text: 'ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውት ቁጥር 1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ግልባጭ ተደርጎለታል፡፡',
              font: 'Nyala',
              size: 24
            })
          ],
          spacing: { after: 600 },
          alignment: AlignmentType.JUSTIFIED
        }),
        
        // Closing
        new Paragraph({
          children: [
            new TextRun({ text: '‹‹ከሰላምታ ጋር››', font: 'Nyala', size: 24 })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),
        
        // Copy distribution
        new Paragraph({
          children: [
            new TextRun({ text: 'ግልባጭ፡-', font: 'Nyala', size: 24, bold: true, underline: {} })
          ],
          spacing: { after: 200 }
        }),
        
        new Paragraph({ children: [new TextRun({ text: 'ለጉምሩክ ኦፕሬሽን ም/ስ/አስኪያጅ', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'የተያዙና የተወረሱ ንብ/አስ/የስራ ሂደት', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ለኢንተለጀንስ እና ኮተረበንድ ክትትል የስራ ሂደት', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ለእቃ አያያዝ ቡድን', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ለውርስ እቃ አስወጋጅ ኮሚቴ', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'መጋዘን 1', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ለበር ጥበቃ', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ለድ/ለኮን/ቁጥ/ድን/ተሻ/ፖሊ/መምሪያ ሪጅመንት 14', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'ድ/ዳ/ጉ/ኮምሽን', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'አቶ {winnerName}', font: 'Nyala', size: 22 })], spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: 'በ/መ', font: 'Nyala', size: 22 })], spacing: { after: 100 } })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save with a new name (you can rename it later)
  fs.writeFileSync('WINNER_LETTER_TEMPLATE_READY.docx', buffer);
  
  console.log('✅ SUCCESS! Template created with placeholders!\n');
  console.log('📄 File: WINNER_LETTER_TEMPLATE_READY.docx');
  console.log('📊 Size:', buffer.length, 'bytes\n');
  console.log('✅ Placeholders included:');
  console.log('   • {refNumber}');
  console.log('   • {date}');
  console.log('   • {tenderNumber}');
  console.log('   • {winnerName}');
  console.log('   • {groupCode}');
  console.log('   • {itemDescription}');
  console.log('   • {winnerPrice}');
  console.log('   • {calc70}');
  console.log('   • {calc30}');
  console.log('   • {vat}');
  console.log('   • {totalWithVAT}\n');
  console.log('🎨 To add your background:');
  console.log('   1. Open the file in Microsoft Word');
  console.log('   2. Go to: Design → Watermark → Custom Watermark');
  console.log('   3. Or: Design → Page Color → Fill Effects → Picture');
  console.log('   4. Add your logo/background');
  console.log('   5. Save the file\n');
  console.log('🚀 The system is ready to use this template!');
  console.log('   When you download a winner letter, it will:');
  console.log('   ✅ Use this template');
  console.log('   ✅ Replace all placeholders with real data');
  console.log('   ✅ Include your background/logo\n');
}

createCompleteTemplate().catch(console.error);
