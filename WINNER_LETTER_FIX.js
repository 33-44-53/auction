// WINNER LETTER COMPLETE FIX
// Replace the winner-letter endpoint and createWinnerLetterFromScratch function in export.js

router.get('/winner-letter/:groupId', async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { 
        tender: true, 
        items: true, 
        bids: { 
          where: { isWinner: true },
          include: { bidder: true } 
        } 
      }
    });
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'SOLD') return res.status(400).json({ error: 'Group must be SOLD to generate winner letter' });
    if (!group.bids || group.bids.length === 0) return res.status(400).json({ error: 'No winner found' });

    const winner = group.bids[0];
    const winnerPrice = winner.bidPrice;
    const calc70 = winnerPrice * 0.70;
    const calc30 = winnerPrice * 0.30;
    const vat = winnerPrice * 0.15;
    const totalWithVAT = calc70 + calc30 + vat;

    // Ethiopian date conversion
    const today = new Date();
    const ethiopianYear = today.getFullYear() - 7;
    const ethiopianDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${ethiopianYear}`;

    // Try to load template file
    const templatePath = path.join(__dirname, '../../የመሸኛ_ደብደዳቤ_winnerformat.docx');
    
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

        // Set template variables
        doc.setData({
          refNumber: `${group.tender.tenderNumber}/${group.code}`,
          date: ethiopianDate,
          tenderNumber: group.tender.tenderNumber,
          winnerName: winner.bidder.name,
          groupCode: group.code,
          itemDescription: group.tender.title || 'የተለያዩ እቃዎች',
          winnerPrice: fmt(winnerPrice),
          calc70: fmt(calc70),
          calc30: fmt(calc30),
          vat: fmt(vat),
          totalWithVAT: fmt(totalWithVAT)
        });

        doc.render();
        buffer = doc.getZip().generate({ type: 'nodebuffer' });
      } catch (templateError) {
        console.error('Template error:', templateError);
        buffer = await createWinnerLetterFromScratch(group, winner, winnerPrice, calc70, calc30, vat, totalWithVAT, ethiopianDate);
      }
    } else {
      console.log('Template file not found, creating from scratch');
      buffer = await createWinnerLetterFromScratch(group, winner, winnerPrice, calc70, calc30, vat, totalWithVAT, ethiopianDate);
    }

    // Send document
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const safeCode = group.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Winner_Letter_${safeCode}.docx"`);
    res.send(buffer);

    if (req.userId) {
      prisma.auditLog.create({
        data: { 
          userId: req.userId, 
          action: 'EXPORT_WINNER_LETTER', 
          entity: 'Group', 
          entityId: groupId, 
          details: JSON.stringify({ 
            groupCode: group.code, 
            winnerName: winner.bidder.name,
            winnerPrice 
          }), 
          ipAddress: req.ip 
        }
      }).catch(() => {});
    }
  } catch (error) { next(error); }
});

// Helper function to create winner letter from scratch (fallback)
async function createWinnerLetterFromScratch(group, winner, winnerPrice, calc70, calc30, vat, totalWithVAT, ethiopianDate) {
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
          text: `ቁጥር/Ref.No: ${group.tender.tenderNumber}/${group.code}`,
          spacing: { after: 200 }
        }),
        
        // Date
        new Paragraph({
          text: `ቀን/Date: ${ethiopianDate}`,
          spacing: { after: 400 }
        }),
        
        // Recipient
        new Paragraph({
          text: 'ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን',
          spacing: { after: 200 }
        }),
        
        // Subject
        new Paragraph({
          children: [
            new TextRun({ text: 'ጉዳዩ፡ ', bold: true }),
            new TextRun({ text: 'በግልፅ ጨረታ የተሸነፈ እቃ ክፍያ' })
          ],
          spacing: { after: 400 }
        }),
        
        // Body paragraph 1
        new Paragraph({
          text: `በድሬ/ዳዋ/ጉምሩክ ቅርንጫፍ ቢሮ ቁጥር ${group.tender.tenderNumber} በ${ethiopianDate} ዓ.ም በተካሄደ ግልፅ ጨረታ ${winner.bidder.name} በኮድ-${group.code} የተለያዩ ${group.tender.title || 'የተለያዩ እቃዎች'} በብር ${fmt(winnerPrice)} ያሸነፉ ሲሆን በግልፅ ጨረታ ያሸነፉት እቃ በተቀመጠው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ በመሆናቸው የሚከተለው የክፍያ መጠን ይከፈላል፡፡`,
          spacing: { after: 400 },
          alignment: AlignmentType.JUSTIFIED
        }),
        
        // Payment breakdown
        new Paragraph({
          children: [
            new TextRun({ text: '70% ', bold: true }),
            new TextRun({ text: '----------------------------------------------------' }),
            new TextRun({ text: ` ${fmt(calc70)}`, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: '30% ', bold: true }),
            new TextRun({ text: '----------------------------------------------------' }),
            new TextRun({ text: ` ${fmt(calc30)}`, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: '15% (ቫት) ', bold: true }),
            new TextRun({ text: '---------------------------------------------' }),
            new TextRun({ text: ` ${fmt(vat)}`, bold: true })
          ],
          spacing: { after: 100 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({ text: 'ጠቅላላ ክፍያ ', bold: true }),
            new TextRun({ text: '-------------------------------------------' }),
            new TextRun({ text: ` ${fmt(totalWithVAT)}`, bold: true })
          ],
          spacing: { after: 400 }
        }),
        
        // Instructions paragraph
        new Paragraph({
          text: 'ተጫራቹ ያሸነፉትን እቃ ለመውሰድ ከፍተኛ ጥረት በማድረግ ከላይ የተገለፀው የክፍያ መጠን ድሬ/ዳዋ/ጉምሩክ ቅርንጫፍ ቢሮ የክፍያ ክፍል 70% በቀጥታ ወደ ሲቢኢ አካውንት ቁጥር 1000014311762 ላይ ገቢ እንዲሆን ደረሰኝ ተቆርጦ ከዚያም 30%ና ቫትን በአካባቢው ሲቢኢ አካውንት 1000014260092 ላይ ገቢ እንዲሆን ደረሰኝ ተቆርጦ ከፍለው ወደ ድሬ/ዳዋ/ጉምሩክ ቅርንጫፍ ቢሮ በመምጣት የእቃውን ክፍያ ከፍለው ለመውሰድ የሚያስችል ደብዳቤ ከቢሮአችን ይዞ ወደ ንብረት አስወጋጅ ኮሚቴ ቢሮ ቁጥር 266 ሄደው በቅርብ ጊዜ ውስጥ እቃውን ከመጋዘን ወስደው ከቢሮአችን ውጪ እንዲያስቀምጡ በአክብሮት እንጠይቃለን፡፡ ከቢሮአችን ውጪ ካላስቀመጡ በቀን 1 ዶላር የእቃውን ክፍያ የማስቀመጫ ክፍያ እንደሚከፍሉ በአክብሮት እናሳውቃለን፡፡ በተጨማሪም በጨረታ የተሸነፈው እቃ በ5 ቀናት ውስጥ ክፍያ ካልከፈሉ ወይም ካልወሰዱ ያስያዙት 5% CPO ይወረሳል፡፡ ውጪ እንዲያስቀምጡ በአክብሮት እንጠይቃለን፡፡',
          spacing: { after: 600 },
          alignment: AlignmentType.JUSTIFIED
        }),
        
        // Closing
        new Paragraph({
          text: '፡፡ የእርሶ ታማኝ ቢሮ፡፡',
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),
        
        // Copy distribution header
        new Paragraph({
          children: [
            new TextRun({ text: 'ግልባጭ፡-', bold: true, underline: {} })
          ],
          spacing: { after: 200 }
        }),
        
        // Distribution list
        new Paragraph({ text: 'ለጉ/ኦ/ም/ስ/አስኪየጅ', spacing: { after: 100 } }),
        new Paragraph({ text: 'የተያዙና የተወረሱ ንብ/አስ/የስራሂደት', spacing: { after: 100 } }),
        new Paragraph({ text: 'ለንብረት አስወጋጅ ኮሚቴ', spacing: { after: 100 } }),
        new Paragraph({ text: 'ድሬደዋ', spacing: { after: 100 } }),
        new Paragraph({ text: winner.bidder.name, spacing: { after: 100 } }),
        new Paragraph({ text: 'ባሉበት', spacing: { after: 100 } }),
        new Paragraph({ text: 'በ/መ', spacing: { after: 600 } }),
        
        // Footer
        new Paragraph({
          text: '"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"',
          alignment: AlignmentType.CENTER
        })
      ]
    }]
  });

  return await Packer.toBuffer(doc);
}
