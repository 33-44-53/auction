const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Keep connection alive on Render (free tier sleeps)
if (process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      // reconnect silently
      await prisma.$connect().catch(() => {});
    }
  }, 4 * 60 * 1000); // every 4 minutes
}

module.exports = prisma;
