-- AlterTable: Add createdBy to Tender and Bidder
-- Step 1: Ensure admin user exists (will be created by ensure-users.js before this runs)

-- Step 2: Add columns as nullable first
ALTER TABLE "Tender" ADD COLUMN "createdBy" INTEGER;
ALTER TABLE "Bidder" ADD COLUMN "createdBy" INTEGER;

-- Step 3: Set all existing records to first admin user
-- Get the first admin user ID dynamically
DO $$
DECLARE
  admin_id INTEGER;
BEGIN
  -- Find first admin user
  SELECT id INTO admin_id FROM "User" WHERE role = 'ADMIN' ORDER BY id LIMIT 1;
  
  -- If no admin found, use first user
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM "User" ORDER BY id LIMIT 1;
  END IF;
  
  -- Update existing records
  IF admin_id IS NOT NULL THEN
    UPDATE "Tender" SET "createdBy" = admin_id WHERE "createdBy" IS NULL;
    UPDATE "Bidder" SET "createdBy" = admin_id WHERE "createdBy" IS NULL;
  END IF;
END $$;

-- Step 4: Make columns NOT NULL
ALTER TABLE "Tender" ALTER COLUMN "createdBy" SET NOT NULL;
ALTER TABLE "Bidder" ALTER COLUMN "createdBy" SET NOT NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bidder" ADD CONSTRAINT "Bidder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Add indexes
CREATE INDEX "Tender_createdBy_idx" ON "Tender"("createdBy");
CREATE INDEX "Bidder_createdBy_idx" ON "Bidder"("createdBy");

-- Step 7: Update User role default from VIEWER to STAFF
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';
