const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = require('docx');
const fs = require('fs');

async function createWinnerLetterTemplate() {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // Header - Reference Number
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
        
        // Body paragraph 1
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
            new TextRun({
              text: '70% ',
              font: 'Nyala',
              size: 24,
              bold: true
            }),
            new TextRun({
              text: '----------------------------------------------------',
              font: 'Nyala',
              size: 24
            }),
            new TextRun({
              text: ' {calc70}',
              font: 'Nyala',
              size: 24,
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '30% ',
              font: 'Nyala',
              size: 24,
              bold: true
            }),
            new TextRun({
              text: '----------------------------------------------------',
              font: 'Nyala',
              size: 24
            }),
            new TextRun({
              text: ' {calc30}',
              font: 'Nyala',
              size: 24,
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: '15% (ቫት) ',
              font: 'Nyala',
              size: 24,
              bold: true
            }),
            new TextRun({
              text: '---------------------------------------------',
              font: 'Nyala',
              size: 24
            }),
            new TextRun({
              text: ' {vat}',
              font: 'Nyala',
              size: 24,
              bold: true
            })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: 'ጠቅላላ ድምር ',
              font: 'Nyala',
              size: 24,
              bold: true
            }),
            new TextRun({
              text: '-------------------------------------------',
              font: 'Nyala',
              size: 24
            }),
            new TextRun({
              text: ' {totalWithVAT}',
              font: 'Nyala',
              size: 24,
              bold: true
            })
          ],
          spacing: { after: 400 }
        }),
        
        // Instructions paragraph
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
            new TextRun({
              text: '‹‹ከሰላምታ ጋር››',
              font: 'Nyala',
              size: 24
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),
        
        // Copy distribution header
        new Paragraph({
          children: [
            new TextRun({
              text: 'ግልባጭ፡-',
              font: 'Nyala',
              size: 24,
              bold: true,
              underline: {}
            })
          ],
          spacing: { after: 200 }
        }),
        
        // Copy distribution list
        new Paragraph({
          children: [new TextRun({ text: 'ለጉምሩክ ኦፕሬሽን ም/ስ/አስኪያጅ', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'የተያዙና የተወረሱ ንብ/አስ/የስራ ሂደት', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ለኢንተለጀንስ እና ኮተረበንድ ክትትል የስራ ሂደት', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ለእቃ አያያዝ ቡድን', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ለውርስ እቃ አስወጋጅ ኮሚቴ', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'መጋዘን 1', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ለበር ጥበቃ', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ለድ/ለኮን/ቁጥ/ድን/ተሻ/ፖሊ/መምሪያ ሪጅመንት 14', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'ድ/ዳ/ጉ/ኮምሽን', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'አቶ {winnerName}', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'በ/መ', font: 'Nyala', size: 22 })],
          spacing: { after: 100 }
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('የመሸኛ_ደብደዳቤ_template_new.docx', buffer);
  
  console.log('✅ New winner letter template created!');
  console.log('📄 File: የመሸኛ_ደብደዳቤ_template_new.docx');
  console.log('');
  console.log('📝 Placeholders included:');
  console.log('   {refNumber} - Reference number');
  console.log('   {date} - Date');
  console.log('   {tenderNumber} - Tender number');
  console.log('   {winnerName} - Winner name');
  console.log('   {groupCode} - Group code');
  console.log('   {itemDescription} - Item description');
  console.log('   {winnerPrice} - Winning price');
  console.log('   {calc70} - 70% calculation');
  console.log('   {calc30} - 30% calculation');
  console.log('   {vat} - VAT 15%');
  console.log('   {totalWithVAT} - Total with VAT');
  console.log('');
  console.log('🎨 Next steps:');
  console.log('   1. Open the new file in Word');
  console.log('   2. Add your background/logo/watermark');
  console.log('   3. Adjust formatting as needed');
  console.log('   4. Save as: የመሸኛ ደብደዳቤ winnerformat.docx');
  console.log('   5. Replace the old file');
}

createWinnerLetterTemplate().catch(console.error);
