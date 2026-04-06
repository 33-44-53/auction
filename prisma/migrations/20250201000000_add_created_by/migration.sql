-- AlterTable: Add createdBy to Tender and Bidder
-- Step 1: Add columns as nullable first
ALTER TABLE "Tender" ADD COLUMN "createdBy" INTEGER;
ALTER TABLE "Bidder" ADD COLUMN "createdBy" INTEGER;

-- Step 2: Set all existing records to admin user (id = 1)
UPDATE "Tender" SET "createdBy" = 1 WHERE "createdBy" IS NULL;
UPDATE "Bidder" SET "createdBy" = 1 WHERE "createdBy" IS NULL;

-- Step 3: Make columns NOT NULL
ALTER TABLE "Tender" ALTER COLUMN "createdBy" SET NOT NULL;
ALTER TABLE "Bidder" ALTER COLUMN "createdBy" SET NOT NULL;

-- Step 4: Add foreign key constraints
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bidder" ADD CONSTRAINT "Bidder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Add indexes
CREATE INDEX "Tender_createdBy_idx" ON "Tender"("createdBy");
CREATE INDEX "Bidder_createdBy_idx" ON "Bidder"("createdBy");

-- Step 6: Update User role default from VIEWER to STAFF
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';
