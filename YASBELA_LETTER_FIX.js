// YASBELA LETTER FIX - Replace generateYasbelaLetterDoc function

async function generateYasbelaLetterDoc(group, winner, penalty, yasbelaType) {
  const tenderNumber = group.tender.tenderNumber;
  const tenderDate = formatEthiopianDate(group.tender.date);
  const refusalDate = formatEthiopianDate(group.yasbelaDate || new Date());
  const winnerName = winner.bidder.name;
  const groupCode = group.code;
  const itemsDescription = getItemsDescriptionText(group.items);
  const winnerPrice = formatCurrencyText(group.winnerPrice);
  const penaltyFormatted = formatCurrencyText(penalty);
  const penaltyInWords = numberToAmharicWords(penalty);

  // Try to load template file
  const templatePath = path.join(__dirname, '../../የመሸኛ_ደብደዳቤ_WITH_PLACEHOLDERS.docx');
  
  let buffer;
  
  if (fs.existsSync(templatePath)) {
    // Use template with background
    try {
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      let mainContent;
      if (yasbelaType === 'NO_PAYMENT') {
        mainContent = `በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃዎች በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡`;
      } else {
        mainContent = `በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃ ክፍያውን ከፍለው እንደማይረከቡ በቀን ${refusalDate} በፃፉት ማመልከቻ ያሳወቁን ስለሆነ ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡`;
      }

      // Set template variables
      doc.setData({
        refNumber: '',
        date: '',
        recipient: 'ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን',
        department: 'ድ/ዳ/ጉ/ኮ',
        mainContent: mainContent,
        penaltyText: `ስለዚህ ተጫራቹ ተጫርተው ያሸነፉት የዕቃ ክፍያ 5% በብር ${penaltyFormatted} /${penaltyInWords}/ መሆኑን እያሳወቅን የእቃውን ዝርዝር ${group.items.length} ገፅ ያያዝን ሲሆን ደረሰኝ ተቆርጦ ገንዘቡ በቀጥታ አካውንት ቁጥር 1000014311762 ላይ ገቢ እንዲሆን እናሳውቃለን፡፡`,
        closing: '// ከሰላምታ ጋር //',
        copyList: `ግልባጭ፡-
ለጉ/ኦ/ም/ስ/አስኪየጅ
የተያዙና የተወረሱ ንብ/አስ/የስራሂደት
ለንብረት አስወጋጅ ኮሚቴ
ድሬደዋ
${winnerName}
ባሉበት
${yasbelaType === 'NO_PAYMENT' ? 'መ/ድ' : 'በ/መ'}`,
        footer: '"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"'
      });

      doc.render();
      buffer = doc.getZip().generate({ type: 'nodebuffer' });

    } catch (templateError) {
      console.error('Yasbela template error:', templateError);
      buffer = await createYasbelaFromScratch(group, winner, penalty, yasbelaType, tenderNumber, tenderDate, refusalDate, winnerName, groupCode, itemsDescription, winnerPrice, penaltyFormatted, penaltyInWords);
    }
  } else {
    console.log('Yasbela template not found, creating from scratch');
    buffer = await createYasbelaFromScratch(group, winner, penalty, yasbelaType, tenderNumber, tenderDate, refusalDate, winnerName, groupCode, itemsDescription, winnerPrice, penaltyFormatted, penaltyInWords);
  }

  return buffer;
}

async function createYasbelaFromScratch(group, winner, penalty, yasbelaType, tenderNumber, tenderDate, refusalDate, winnerName, groupCode, itemsDescription, winnerPrice, penaltyFormatted, penaltyInWords) {
  let mainContent;
  if (yasbelaType === 'NO_PAYMENT') {
    mainContent = `በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃዎች በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡`;
  } else {
    mainContent = `በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃ ክፍያውን ከፍለው እንደማይረከቡ በቀን ${refusalDate} በፃፉት ማመልከቻ ያሳወቁን ስለሆነ ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡`;
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: 'ቁጥር፡-………………', spacing: { after: 200 } }),
        new Paragraph({ text: 'ቀን፡-………………', spacing: { after: 400 } }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        new Paragraph({ text: 'ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን', spacing: { after: 200 } }),
        new Paragraph({ text: 'ድ/ዳ/ጉ/ኮ', spacing: { after: 400 } }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        new Paragraph({ text: mainContent, spacing: { after: 400 } }),
        new Paragraph({ 
          text: `ስለዚህ ተጫራቹ ተጫርተው ያሸነፉት የዕቃ ክፍያ 5% በብር ${penaltyFormatted} /${penaltyInWords}/ መሆኑን እያሳወቅን የእቃውን ዝርዝር ${group.items.length} ገፅ ያያዝን ሲሆን ደረሰኝ ተቆርጦ ገንዘቡ በቀጥታ አካውንት ቁጥር 1000014311762 ላይ ገቢ እንዲሆን እናሳውቃለን፡፡`,
          spacing: { after: 600 }
        }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        new Paragraph({ text: '// ከሰላምታ ጋር //', spacing: { after: 600 } }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        new Paragraph({ text: 'ግልባጭ፡-', spacing: { after: 200 } }),
        new Paragraph({ text: 'ለጉ/ኦ/ም/ስ/አስኪየጅ', spacing: { after: 100 } }),
        new Paragraph({ text: 'የተያዙና የተወረሱ ንብ/አስ/የስራሂደት', spacing: { after: 100 } }),
        new Paragraph({ text: 'ለንብረት አስወጋጅ ኮሚቴ', spacing: { after: 100 } }),
        new Paragraph({ text: 'ድሬደዋ', spacing: { after: 100 } }),
        new Paragraph({ text: winnerName, spacing: { after: 100 } }),
        new Paragraph({ text: 'ባሉበት', spacing: { after: 100 } }),
        new Paragraph({ text: yasbelaType === 'NO_PAYMENT' ? 'መ/ድ' : 'በ/መ', spacing: { after: 600 } }),
        new Paragraph({ text: '', spacing: { after: 200 } }),
        new Paragraph({ 
          text: '"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"',
          alignment: AlignmentType.CENTER
        })
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}
