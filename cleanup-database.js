const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Database Cleanup Utility
 * Run this script periodically to keep database size under control
 */

async function cleanupAuditLogs(daysToKeep = 90) {
  console.log(`\n🧹 Cleaning up audit logs older than ${daysToKeep} days...`);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    // Keep important logs forever
    const importantActions = ['SELECT_WINNER', 'CLOSE_GROUP', 'SEND_TO_HARAJ', 'YASBELA'];
    
    const deleted = await prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
        action: { notIn: importantActions }
      }
    });
    
    console.log(`✅ Deleted ${deleted.count} old audit logs`);
    return deleted.count;
  } catch (error) {
    console.error('❌ Error cleaning audit logs:', error.message);
    return 0;
  }
}

async function archiveOldTenders(monthsToKeep = 12) {
  console.log(`\n📦 Archiving tenders older than ${monthsToKeep} months...`);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
  
  try {
    const archived = await prisma.tender.updateMany({
      where: {
        status: { in: ['CLOSED', 'COMPLETED'] },
        updatedAt: { lt: cutoffDate }
      },
      data: {
        status: 'ARCHIVED'
      }
    });
    
    console.log(`✅ Archived ${archived.count} old tenders`);
    return archived.count;
  } catch (error) {
    console.error('❌ Error archiving tenders:', error.message);
    return 0;
  }
}

async function deleteVeryOldData(yearsToKeep = 2) {
  console.log(`\n🗑️  Deleting archived data older than ${yearsToKeep} years...`);
  
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsToKeep);
  
  try {
    // This will cascade delete all related groups, items, bids, etc.
    const deleted = await prisma.tender.deleteMany({
      where: {
        status: 'ARCHIVED',
        updatedAt: { lt: cutoffDate }
      }
    });
    
    console.log(`✅ Deleted ${deleted.count} very old tenders and all related data`);
    return deleted.count;
  } catch (error) {
    console.error('❌ Error deleting old data:', error.message);
    return 0;
  }
}

async function getStorageStats() {
  console.log('\n📊 Current Database Statistics:');
  console.log('='.repeat(60));
  
  try {
    const stats = {
      users: await prisma.user.count(),
      tenders: await prisma.tender.count(),
      groups: await prisma.group.count(),
      items: await prisma.item.count(),
      bidders: await prisma.bidder.count(),
      bids: await prisma.bid.count(),
      auditLogs: await prisma.auditLog.count()
    };
    
    // Estimate storage
    const estimatedBytes = 
      (stats.users * 200) +
      (stats.tenders * 500) +
      (stats.groups * 800) +
      (stats.items * 400) +
      (stats.bidders * 300) +
      (stats.bids * 150) +
      (stats.auditLogs * 500);
    
    const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(2);
    
    console.log(`Users:              ${stats.users.toLocaleString()}`);
    console.log(`Tenders:            ${stats.tenders.toLocaleString()}`);
    console.log(`Groups:             ${stats.groups.toLocaleString()}`);
    console.log(`Items:              ${stats.items.toLocaleString()}`);
    console.log(`Bidders:            ${stats.bidders.toLocaleString()}`);
    console.log(`Bids:               ${stats.bids.toLocaleString()}`);
    console.log(`Audit Logs:         ${stats.auditLogs.toLocaleString()}`);
    console.log('='.repeat(60));
    console.log(`Estimated Size:     ${estimatedMB} MB`);
    
    // Warnings
    if (estimatedMB > 15) {
      console.log('\n⚠️  WARNING: Database size approaching limits!');
      console.log('   Recommended: Run cleanup or consider upgrading');
    }
    
    if (estimatedMB > 20) {
      console.log('\n🚨 CRITICAL: Database size exceeding safe limits!');
      console.log('   Action Required: Upgrade to Neon Pro or aggressive cleanup');
    }
    
    if (stats.auditLogs > 10000) {
      console.log('\n⚠️  Audit logs are large. Consider running cleanup.');
    }
    
    if (stats.items > 50000) {
      console.log('\n⚠️  Items table is large. This is normal for active systems.');
    }
    
    return { stats, estimatedMB: parseFloat(estimatedMB) };
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
    return null;
  }
}

async function runFullCleanup(options = {}) {
  const {
    auditLogDays = 90,
    archiveMonths = 12,
    deleteYears = 2,
    dryRun = false
  } = options;
  
  console.log('\n' + '='.repeat(60));
  console.log('DATABASE CLEANUP UTILITY');
  console.log('='.repeat(60));
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  // Get initial stats
  const beforeStats = await getStorageStats();
  
  if (!dryRun) {
    // Run cleanup operations
    const auditLogsDeleted = await cleanupAuditLogs(auditLogDays);
    const tendersArchived = await archiveOldTenders(archiveMonths);
    const dataDeleted = await deleteVeryOldData(deleteYears);
    
    // Get final stats
    console.log('\n' + '='.repeat(60));
    const afterStats = await getStorageStats();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Audit logs deleted:     ${auditLogsDeleted.toLocaleString()}`);
    console.log(`Tenders archived:       ${tendersArchived.toLocaleString()}`);
    console.log(`Old tenders deleted:    ${dataDeleted.toLocaleString()}`);
    
    if (beforeStats && afterStats) {
      const saved = (beforeStats.estimatedMB - afterStats.estimatedMB).toFixed(2);
      console.log(`Storage saved:          ${saved} MB`);
    }
    
    console.log('='.repeat(60));
    console.log('✅ Cleanup completed successfully!\n');
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  (async () => {
    try {
      switch (command) {
        case 'stats':
          await getStorageStats();
          break;
          
        case 'audit-logs':
          const days = parseInt(args[1]) || 90;
          await cleanupAuditLogs(days);
          break;
          
        case 'archive':
          const months = parseInt(args[1]) || 12;
          await archiveOldTenders(months);
          break;
          
        case 'delete-old':
          const years = parseInt(args[1]) || 2;
          await deleteVeryOldData(years);
          break;
          
        case 'full':
          const dryRun = args.includes('--dry-run');
          await runFullCleanup({ dryRun });
          break;
          
        case 'help':
        default:
          console.log('\n📖 Database Cleanup Utility - Usage:\n');
          console.log('  node cleanup-database.js stats              - Show current statistics');
          console.log('  node cleanup-database.js audit-logs [days]  - Clean audit logs (default: 90 days)');
          console.log('  node cleanup-database.js archive [months]   - Archive old tenders (default: 12 months)');
          console.log('  node cleanup-database.js delete-old [years] - Delete archived data (default: 2 years)');
          console.log('  node cleanup-database.js full               - Run full cleanup');
          console.log('  node cleanup-database.js full --dry-run     - Preview cleanup without changes');
          console.log('  node cleanup-database.js help               - Show this help\n');
          console.log('Examples:');
          console.log('  node cleanup-database.js stats');
          console.log('  node cleanup-database.js audit-logs 60');
          console.log('  node cleanup-database.js full --dry-run\n');
          break;
      }
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}

module.exports = {
  cleanupAuditLogs,
  archiveOldTenders,
  deleteVeryOldData,
  getStorageStats,
  runFullCleanup
};
