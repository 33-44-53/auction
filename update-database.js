const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDatabase() {
  console.log('Starting database update...');

  try {
    // Step 1: Add createdBy columns (SQLite doesn't support ALTER TABLE ADD COLUMN with NOT NULL directly)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Tender_new" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT,
        "tenderNumber" TEXT NOT NULL,
        "tenderType" TEXT NOT NULL DEFAULT 'AUCTION',
        "originalTenderId" INTEGER,
        "harajRound" INTEGER NOT NULL DEFAULT 1,
        "date" DATETIME,
        "location" TEXT,
        "responsibleBody" TEXT,
        "exchangeRate" REAL NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "createdBy" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Tender_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Tender_originalTenderId_fkey" FOREIGN KEY ("originalTenderId") REFERENCES "Tender" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Tender_new" SELECT id, title, tenderNumber, tenderType, originalTenderId, harajRound, date, location, responsibleBody, exchangeRate, status, 1, createdAt, updatedAt FROM "Tender";
    `);

    await prisma.$executeRawUnsafe(`DROP TABLE "Tender";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Tender_new" RENAME TO "Tender";`);

    // Create indexes for Tender
    await prisma.$executeRawUnsafe(`CREATE INDEX "Tender_status_idx" ON "Tender"("status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Tender_createdAt_idx" ON "Tender"("createdAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Tender_tenderNumber_idx" ON "Tender"("tenderNumber");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Tender_createdBy_idx" ON "Tender"("createdBy");`);

    console.log('✓ Tender table updated');

    // Step 2: Update Bidder table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Bidder_new" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "companyName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "email" TEXT,
        "address" TEXT,
        "tin" TEXT,
        "createdBy" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        CONSTRAINT "Bidder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Bidder_new" SELECT id, name, companyName, phone, email, address, tin, 1, createdAt, updatedAt FROM "Bidder";
    `);

    await prisma.$executeRawUnsafe(`DROP TABLE "Bidder";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Bidder_new" RENAME TO "Bidder";`);

    // Create index for Bidder
    await prisma.$executeRawUnsafe(`CREATE INDEX "Bidder_createdBy_idx" ON "Bidder"("createdBy");`);

    console.log('✓ Bidder table updated');

    // Step 3: Recreate all dependent tables first, then User
    // Get existing audit logs
    const auditLogs = await prisma.$queryRawUnsafe(`SELECT * FROM "AuditLog";`);
    
    // Drop AuditLog temporarily
    await prisma.$executeRawUnsafe(`DROP TABLE "AuditLog";`);

    // Update User table default role
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "User_new" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'STAFF',
        "isActive" INTEGER NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "User_new" SELECT id, name, email, password, role, isActive, createdAt, updatedAt FROM "User";
    `);

    await prisma.$executeRawUnsafe(`DROP TABLE "User";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User_new" RENAME TO "User";`);

    // Create unique index for User
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`);

    console.log('✓ User table updated');

    // Recreate AuditLog table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "AuditLog" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "userId" INTEGER NOT NULL,
        "action" TEXT NOT NULL,
        "entity" TEXT NOT NULL,
        "entityId" INTEGER,
        "details" TEXT,
        "ipAddress" TEXT,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    // Restore audit logs
    for (const log of auditLogs) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "AuditLog" (id, userId, action, entity, entityId, details, ipAddress, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        log.id, log.userId, log.action, log.entity, log.entityId, log.details, log.ipAddress, log.timestamp
      );
    }

    // Create indexes for AuditLog
    await prisma.$executeRawUnsafe(`CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");`);

    console.log('✓ AuditLog table recreated');

    console.log('✅ Database update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabase();
