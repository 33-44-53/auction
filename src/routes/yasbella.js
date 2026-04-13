const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { Document, Packer, Paragraph, TextRun } = require('docx');

// Generate Yasbella letter
router.post('/generate', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
  try {
    const { groupId, reason } = req.body;
    
    if (!groupId || !reason) {
      return res.status(400).json({ error: 'groupId and reason are required' });
    }

    if (!['NO_PAYMENT', 'REFUSED_TO_PAY'].includes(reason)) {
      return res.status(400).json({ error: 'reason must be NO_PAYMENT or REFUSED_TO_PAY' });
    }

    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: {
        tender: true,
        items: true,
        bids: {
          where: { isWinner: true },
          include: { bidder: true }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'SOLD' && group.status !== 'YASBELA') {
      return res.status(400).json({ error: 'Group must be SOLD or YASBELA to generate letter' });
    }

    const winner = group.bids[0];
    if (!winner) {
      return res.status(400).json({ error: 'No winner found for this group' });
    }

    const penalty = group.winnerPrice * 0.05;
    const penaltyInWords = numberToAmharicWords(penalty);

    let letterContent;
    if (reason === 'NO_PAYMENT') {
      letterContent = generateNoPaymentLetter(group, winner, penalty, penaltyInWords);
    } else {
      letterContent = generateRefusedToPayLetter(group, winner, penalty, penaltyInWords);
    }

    // Update group with yasbella info
    await prisma.group.update({
      where: { id: parseInt(groupId) },
      data: {
        yasbelaType: reason,
        yasbelaPenalty: penalty,
        yasbelaDate: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'GENERATE_YASBELLA_LETTER',
        entity: 'Group',
        entityId: parseInt(groupId),
        details: JSON.stringify({ reason, penalty, winnerName: winner.bidder.name }),
        ipAddress: req.ip
      }
    });

    res.json({
      letterContent,
      penalty,
      reason,
      winnerName: winner.bidder.name
    });
  } catch (error) {
    next(error);
  }
});

// Download Yasbella letter as DOCX
router.get('/download/:groupId', authorize('ADMIN', 'STAFF'), async (req, res, next) => {
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

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.status !== 'SOLD' && group.status !== 'YASBELA') {
      return res.status(400).json({ error: 'Group must be SOLD or YASBELA to download letter' });
    }

    const winner = group.bids[0];
    if (!winner) {
      return res.status(400).json({ error: 'No winner found for this group' });
    }

    const penalty = group.winnerPrice * 0.05;
    const penaltyInWords = numberToAmharicWords(penalty);
    const yasbelaType = group.yasbelaType || 'NO_PAYMENT';
    
    const today = new Date();
    const ethiopianYear = today.getFullYear() - 7;
    const ethiopianDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${ethiopianYear}`;
    const tenderDate = formatEthiopianDate(group.tender.date);

    const templatePath = path.join(__dirname, '../../yasbella.docx');
    let buffer;
    
    if (fs.existsSync(templatePath)) {
      try {
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        doc.setData({
          refNumber: `${group.tender.tenderNumber}/${group.code}`,
          currentDate: ethiopianDate,
          tenderNumber: group.tender.tenderNumber,
          tenderDate: tenderDate,
          winnerName: winner.bidder.name,
          groupCode: group.code,
          itemDescription: group.items.length + ' ገፅ እቃዎች',
          winnerPrice: formatCurrency(group.winnerPrice),
          penalty: formatCurrency(penalty),
          penaltyInWords: penaltyInWords,
          itemCount: group.items.length
        });

        doc.render();
        buffer = doc.getZip().generate({ type: 'nodebuffer' });
      } catch (templateError) {
        console.error('Template error:', templateError);
        buffer = createYasbellaDocFromScratch(group, winner, penalty, penaltyInWords, ethiopianDate);
      }
    } else {
      buffer = createYasbellaDocFromScratch(group, winner, penalty, penaltyInWords, ethiopianDate);
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const safeCode = group.code.replace(/[^a-zA-Z0-9\-_]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="Yasbella_Letter_${safeCode}.docx"`);
    res.send(buffer);

    if (req.userId) {
      prisma.auditLog.create({
        data: {
          userId: req.userId,
          action: 'DOWNLOAD_YASBELLA_LETTER',
          entity: 'Group',
          entityId: groupId,
          details: JSON.stringify({ groupCode: group.code, winnerName: winner.bidder.name }),
          ipAddress: req.ip
        }
      }).catch(() => {});
    }
  } catch (error) {
    next(error);
  }
});

function createYasbellaDocFromScratch(group, winner, penalty, penaltyInWords, ethiopianDate) {
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        new Paragraph({
          text: `ቁጥር፡ ${group.tender.tenderNumber}/${group.code}`,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: `ቀን፡ ${ethiopianDate}`,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: 'ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን',
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: 'ድ/ዳ/ጉ/ኮ',
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: `በግልፅ ጨረታ ቁጥር ${group.tender.tenderNumber} በ${formatEthiopianDate(group.tender.date)} ዓ.ም በተካሄደ ጨረታ ${winner.bidder.name} የተባሉት ተጫራች በኮድ-${group.code} በብር ${formatCurrency(group.winnerPrice)} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃዎች በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡`,
          spacing: { after: 400 }
        })
      ]
    }]
  });
  
  return Packer.toBuffer(doc);
}

function generateNoPaymentLetter(group, winner, penalty, penaltyInWords) {
  const tenderNumber = group.tender.tenderNumber;
  const tenderDate = formatEthiopianDate(group.tender.date);
  const winnerName = winner.bidder.name;
  const groupCode = group.code;
  const itemsDescription = getItemsDescription(group.items);
  const winnerPrice = formatCurrency(group.winnerPrice);
  const penaltyFormatted = formatCurrency(penalty);

  return `ቁጥር፡-………………
ቀን፡-………………

ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን
ድ/ዳ/ጉ/ኮ

በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃዎች በተቀመጠላቸው የጊዜ ገደብ ውስጥ ክፍያውን ከፍለው ለመውሰድ ፈቃደኛ ባለመሆናቸው ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡

ስለዚህ ተጫራቹ ተጫርተው ያሸነፉት የዕቃ ክፍያ 5% በብር ${penaltyFormatted} /${penaltyInWords}/ መሆኑን እያሳወቅን የእቃውን ዝርዝር ${group.items.length} ገፅ ያያዝን ሲሆን ደረሰኝ ተቆርጦ ገንዘቡ በቀጥታ አካውንት ቁጥር 1000014311762 ላይ ገቢ እንዲሆን እናሳውቃለን፡፡

// ከሰላምታ ጋር //

ግልባጭ፡-
ለጉ/ኦ/ም/ስ/አስኪየጅ
የተያዙና የተወረሱ ንብ/አስ/የስራሂደት
ለንብረት አስወጋጅ ኮሚቴ
ድሬደዋ
${winnerName}
ባሉበት
መ/ድ

"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"`;
}

function generateRefusedToPayLetter(group, winner, penalty, penaltyInWords) {
  const tenderNumber = group.tender.tenderNumber;
  const tenderDate = formatEthiopianDate(group.tender.date);
  const refusalDate = formatEthiopianDate(group.yasbelaDate || new Date());
  const winnerName = winner.bidder.name;
  const groupCode = group.code;
  const itemsDescription = getItemsDescription(group.items);
  const winnerPrice = formatCurrency(group.winnerPrice);
  const penaltyFormatted = formatCurrency(penalty);

  return `ቁጥር፡-………………
ቀን፡-………………

ለገቢ አሰባሰብ እና ዋስትና አያያዝ ቡድን
ድ/ዳ/ጉ/ኮ

በግልፅ ጨረታ ቁጥር ${tenderNumber} በቀን ${tenderDate} ዓ.ም በተካሄደ ጨረታ ${winnerName} የተባሉት ተጫራች በኮድ-${groupCode} ${itemsDescription} በብር ${winnerPrice} ያሸነፉ ሲሆን ነገር ግን ያሸነፉትን እቃ ክፍያውን ከፍለው እንደማይረከቡ በቀን ${refusalDate} በፃፉት ማመልከቻ ያሳወቁን ስለሆነ ለጨረታ ያስያዙት 5% ለመንግስት ገቢ እንዲሆን እናሳውቃለን፡፡

ስለዚህ ተጫራቹ ተጫርተው ያሸነፉት የዕቃ ክፍያ 5% በብር ${penaltyFormatted} /${penaltyInWords}/ መሆኑን እያሳወቅን የእቃውን ዝርዝር ${group.items.length} ገፅ ያያዝን ሲሆን ደረሰኝ ተቆርጦ ገንዘቡ በቀጥታ አካውንት ቁጥር 1000014311762 ላይ ገቢ እንዲሆን እናሳውቃለን፡፡

// ከሰላምታ ጋር //

ግልባጭ፡-
ለጉ/ኦ/ም/ስ/አስኪየጅ
የተያዙና የተወረሱ ንብ/አስ/የስራሂደት
ለንብረት አስወጋጅ ኮሚቴ
ድሬደዋ
${winnerName}
ባሉበት
በ/መ

"ደረጃውን የጠበቀ ዘመናዊ የጉምሩክ አስተዳደር እንዲሰፍን እንተጋለን"`;
}

function getItemsDescription(items) {
  if (items.length === 0) return 'የተለያዩ እቃዎች';
  
  const types = [...new Set(items.map(i => i.itemType).filter(Boolean))];
  if (types.length > 0) {
    return types.join('፣ ');
  }
  
  return 'የተለያዩ እቃዎች';
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatEthiopianDate(date) {
  if (!date) return '____/____/____';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

function numberToAmharicWords(num) {
  const ones = ['', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ'];
  const tens = ['', 'አስር', 'ሃያ', 'ሰላሳ', 'አርባ', 'ሃምሳ', 'ስልሳ', 'ሰባ', 'ሰማንያ', 'ዘጠና'];
  const hundreds = ['', 'አንድ መቶ', 'ሁለት መቶ', 'ሶስት መቶ', 'አራት መቶ', 'አምስት መቶ', 'ስድስት መቶ', 'ሰባት መቶ', 'ስምንት መቶ', 'ዘጠኝ መቶ'];

  if (num === 0) return 'ዜሮ';
  
  const [intPart, decPart] = num.toFixed(2).split('.');
  const integer = parseInt(intPart);
  
  let result = '';
  
  if (integer >= 1000000) {
    const millions = Math.floor(integer / 1000000);
    result += convertThreeDigits(millions) + ' ሚሊዮን ';
  }
  
  const remainder = integer % 1000000;
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    result += convertThreeDigits(thousands) + ' ሺህ ';
  }
  
  const lastThree = integer % 1000;
  if (lastThree > 0) {
    result += convertThreeDigits(lastThree);
  }
  
  result += ' ብር';
  
  if (decPart && parseInt(decPart) > 0) {
    result += ' ' + decPart + '/100';
  }
  
  return result.trim();
}

function convertThreeDigits(num) {
  const ones = ['', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ'];
  const tens = ['', 'አስር', 'ሃያ', 'ሰላሳ', 'አርባ', 'ሃምሳ', 'ስልሳ', 'ሰባ', 'ሰማንያ', 'ዘጠና'];
  const hundreds = ['', 'አንድ መቶ', 'ሁለት መቶ', 'ሶስት መቶ', 'አራት መቶ', 'አምስት መቶ', 'ስድስት መቶ', 'ሰባት መቶ', 'ስምንት መቶ', 'ዘጠኝ መቶ'];
  
  let result = '';
  
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;
  
  if (h > 0) result += hundreds[h] + ' ';
  if (t > 0) result += tens[t] + ' ';
  if (o > 0) result += ones[o];
  
  return result.trim();
}

module.exports = router;
