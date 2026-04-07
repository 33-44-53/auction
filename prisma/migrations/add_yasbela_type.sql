-- Add yasbelaType column to Group table
-- Migration: add_yasbela_type

-- Add the yasbelaType column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Group' 
        AND column_name = 'yasbelaType'
    ) THEN
        ALTER TABLE "Group" ADD COLUMN "yasbelaType" TEXT;
    END IF;
END $$;

-- Update existing YASBELA groups to have default type
UPDATE "Group" 
SET "yasbelaType" = 'NO_PAYMENT' 
WHERE status = 'YASBELA' AND "yasbelaType" IS NULL;
