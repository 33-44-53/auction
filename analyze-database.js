const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeDatabaseStorage() {
  console.log('='.repeat(80));
  console.log('DATABASE STORAGE ANALYSIS');
  console.log('='.repeat(80));
  console.log();

  try {
    // Count records in each table
    const userCount = await prisma.user.count();
    const tenderCount = await prisma.tender.count();
    const groupCount = await prisma.group.count();
    const itemCount = await prisma.item.count();
    const bidderCount = await prisma.bidder.count();
    const bidCount = await prisma.bid.count();
    const fileCount = await prisma.file.count();
    const auditLogCount = await prisma.auditLog.count();
    const bidderGroupCount = await prisma.bidderGroup.count();

    console.log('📊 RECORD COUNTS:');
    console.log('-'.repeat(80));
    console.log(`Users:              ${userCount.toLocaleString()}`);
    console.log(`Tenders:            ${tenderCount.toLocaleString()}`);
    console.log(`Groups:             ${groupCount.toLocaleString()}`);
    console.log(`Items:              ${itemCount.toLocaleString()}`);
    console.log(`Bidders:            ${bidderCount.toLocaleString()}`);
    console.log(`Bids:               ${bidCount.toLocaleString()}`);
    console.log(`Files:              ${fileCount.toLocaleString()}`);
    console.log(`Audit Logs:         ${auditLogCount.toLocaleString()}`);
    console.log(`Bidder-Group Links: ${bidderGroupCount.toLocaleString()}`);
    console.log();

    // Get sample data sizes
    console.log('📦 SAMPLE DATA ANALYSIS:');
    console.log('-'.repeat(80));

    // Check audit logs (often the largest table)
    const auditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        action: true,
        details: true,
        timestamp: true
      }
    });

    console.log('\nRecent Audit Logs (sample):');
    auditLogs.forEach(log => {
      const detailsSize = log.details ? log.details.length : 0;
      console.log(`  - ${log.action} (${log.timestamp.toISOString()}) - Details: ${detailsSize} chars`);
    });

    // Check files table
    const files = await prisma.file.findMany({
      select: {
        id: true,
        filename: true,
        size: true,
        path: true
      }
    });

    console.log('\nFiles stored in database:');
    let totalFileSize = 0;
    files.forEach(file => {
      const sizeKB = file.size ? (file.size / 1024).toFixed(2) : 0;
      totalFileSize += file.size || 0;
      console.log(`  - ${file.filename}: ${sizeKB} KB (path: ${file.path})`);
    });
    console.log(`  Total file metadata size: ${(totalFileSize / 1024 / 1024).toFixed(2)} MB`);

    // Check items (can be large with many records)
    const itemSample = await prisma.item.findFirst({
      select: {
        id: true,
        name: true,
        itemCode: true,
        serialNumber: true,
        brand: true,
        country: true
      }
    });

    console.log('\nSample Item Record:');
    console.log(`  ${JSON.stringify(itemSample, null, 2)}`);

    // Estimate storage per table
    console.log('\n💾 ESTIMATED STORAGE PER TABLE:');
    console.log('-'.repeat(80));
    
    // Rough estimates (bytes per record)
    const estimates = {
      User: userCount * 200,
      Tender: tenderCount * 500,
      Group: groupCount * 800,
      Item: itemCount * 400,
      Bidder: bidderCount * 300,
      Bid: bidCount * 150,
      File: fileCount * 200,
      AuditLog: auditLogCount * 500, // Can be large with JSON details
      BidderGroup: bidderGroupCount * 50
    };

    let totalEstimated = 0;
    Object.entries(estimates).forEach(([table, bytes]) => {
      const mb = (bytes / 1024 / 1024).toFixed(2);
      totalEstimated += bytes;
      console.log(`${table.padEnd(20)} ~${mb} MB`);
    });

    console.log('-'.repeat(80));
    console.log(`Total Estimated:     ~${(totalEstimated / 1024 / 1024).toFixed(2)} MB`);
    console.log();

    // Check for potential issues
    console.log('⚠️  POTENTIAL STORAGE ISSUES:');
    console.log('-'.repeat(80));

    if (auditLogCount > 10000) {
      console.log(`❌ Audit logs are very large (${auditLogCount.toLocaleString()} records)`);
      console.log('   Consider implementing log rotation or archiving old logs');
    }

    if (itemCount > 50000) {
      console.log(`❌ Items table is very large (${itemCount.toLocaleString()} records)`);
      console.log('   This is normal for auction systems with many items');
    }

    if (fileCount > 100) {
      console.log(`⚠️  Many file records (${fileCount})`);
      console.log('   Note: Actual files are stored in uploads/ folder, not in database');
    }

    console.log();
    console.log('📝 RECOMMENDATIONS:');
    console.log('-'.repeat(80));
    console.log('1. Audit logs grow over time - implement log rotation');
    console.log('2. Files are stored on disk (uploads/), only metadata in DB');
    console.log('3. Consider archiving old tenders to reduce database size');
    console.log('4. Add indexes on frequently queried columns (already done)');
    console.log('5. Monitor database growth and set up alerts');
    console.log();

  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabaseStorage();
