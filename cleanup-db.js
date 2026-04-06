const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "User_new";`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Tender_new";`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "Bidder_new";`);
    console.log('✓ Cleanup completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
