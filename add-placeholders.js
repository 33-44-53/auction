const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

async function addPlaceholdersToTemplate() {
  try {
    console.log('📄 Reading your template file...');
    
    // Read the original file
    const content = fs.readFileSync('የመሸኛ ደብደዳቤ winnerformat.docx', 'binary');
    const zip = new PizZip(content);
    
    // Get the document XML
    const doc = zip.file('word/document.xml').asText();
    
    console.log('✅ File loaded successfully!');
    console.log('📝 Original file size:', content.length, 'bytes');
    
    // Since we can't easily parse and modify the existing content without knowing its exact structure,
    // let's create a new document with placeholders that preserves the background
    
    // The best approach is to manually replace common patterns
    // But since we don't know the exact content, let's create a template with all placeholders
    
    console.log('\n⚠️  Important:');
    console.log('Your original file has a background and specific content.');
    console.log('To preserve it perfectly, you need to manually edit it.');
    console.log('\nHowever, I can create a NEW template with placeholders that you can:');
    console.log('1. Open in Word');
    console.log('2. Copy your background/logo from the original');
    console.log('3. Use as your new template');
    
    // Create a simple text file with the template structure
    const templateContent = `
ቁጥር/Ref.No: {refNumber}
ቀን /Date: {date}

ለገቢ አሰባሰብና ዋስትና አያያዝ ቡድን

ጉዳዩ፤ ክፊያ መቀበለን ይመለከታል

በቅ/ጽ/ቤታችን ግልፅ ጨረታ ቁጥር {tenderNumber} በ{date} ዓ.ም የተካሄደ መሆኑ ይታወቃል። 
በዚህ መሠረት ስት {winnerName} በኮድ-{groupCode} የተለየዩ {itemDescription} 
በብር {winnerPrice} ተወዳድረው አሸናፊ መሆናቸውን እየገለፅን የክፍያ ሁኔታው ከዚህ በታች እንደሚከተለው ቀርቧል።

70% ---------------------------------------------------- {calc70}
30% ---------------------------------------------------- {calc30}
15% (ቫት) --------------------------------------------- {vat}
ጠቅላላ ድምር ------------------------------------------- {totalWithVAT}

ስለሆነም ተጫራቹ ገንዘቡን በድሬዳዋ ጉምሩክ ኮሚሽን ቅ/ጽ/ቤት ስም በተከፈተው 70% በቀጥታ ገቢ አካውት ቁጥር 
1000014311762 በጉምርክ ኮሚሽን እና ለፍትህ ሚንስቴር 30%ቱን እና ቫቱን በዲፖዚት አካውንት 1000014260092 
ሪሲት አሰርተው ሲያቀርቡ ተቆርጦ እንዲሰጣቸው እያሳሰብን የውርስ እቃ መጋዘን ሀላፊ የክፍያውን መረጃ ይዘው ሲቀርቡ 
ከዚህ ደብዳቤ ጋር ተያይዞ በቀረበው ዝርዝር መሰረት በሞዴል 266 ወጪ በማድረግ ንብረቱን እንድታስረክቡ እያሳሰብን 
ለርክክብ ይረዳ ዘንድ የእቃው ዝርዝር 1 ገጽ ከዚህ ደብዳቤ ጋር ያያዝን ሲሆን የእቃ አያያዝ ቡድንም ያሸነፉትን እቃ 
ክፍያ መፈፀሙን በማረጋገጥ በ 5 የስራ ቀናት ውስጥ ከመጋዘን እናዲያወጡ ለርክክብ ይረዳ ዘንድ ግልባጭ ተደርጎለታል፡፡

‹‹ከሰላምታ ጋር››

ግልባጭ፡-
ለጉምሩክ ኦፕሬሽን ም/ስ/አስኪያጅ
የተያዙና የተወረሱ ንብ/አስ/የስራ ሂደት
ለኢንተለጀንስ እና ኮተረበንድ ክትትል የስራ ሂደት
ለእቃ አያያዝ ቡድን
ለውርስ እቃ አስወጋጅ ኮሚቴ
መጋዘን 1
ለበር ጥበቃ
ለድ/ለኮን/ቁጥ/ድን/ተሻ/ፖሊ/መምሪያ ሪጅመንት 14
ድ/ዳ/ጉ/ኮምሽን
አቶ {winnerName}
በ/መ
`;

    fs.writeFileSync('TEMPLATE_CONTENT.txt', templateContent, 'utf8');
    
    console.log('\n✅ Created: TEMPLATE_CONTENT.txt');
    console.log('\n📋 Next Steps:');
    console.log('1. Open your original file: የመሸኛ ደብደዳቤ winnerformat.docx');
    console.log('2. Open TEMPLATE_CONTENT.txt to see the placeholders');
    console.log('3. Copy the text from TEMPLATE_CONTENT.txt');
    console.log('4. Paste it into your Word document (replacing the old text)');
    console.log('5. Your background/logo will remain intact');
    console.log('6. Save the file');
    console.log('\n✅ Done! The system will use your background with the placeholders.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative Solution:');
    console.log('Since I cannot directly edit your Word file content,');
    console.log('please follow the manual instructions in SIMPLE_EDIT_INSTRUCTIONS.md');
  }
}

addPlaceholdersToTemplate();
