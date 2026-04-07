-- AlterTable
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "yasbelaType" TEXT;

-- Update existing YASBELA groups
UPDATE "Group" SET "yasbelaType" = 'NO_PAYMENT' WHERE status = 'YASBELA' AND "yasbelaType" IS NULL;
