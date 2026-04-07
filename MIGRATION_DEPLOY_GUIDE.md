# Deploy Yasbela Type Migration to Render

## The Issue
The server is returning 500 errors because the database doesn't have the `yasbelaType` column yet.

## Solution: Run Migration on Render

### Option 1: Automatic (Recommended)
Render will automatically run migrations on next deployment if you have this in your build command:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Steps:**
1. Go to Render Dashboard
2. Find your service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Migration will run automatically

### Option 2: Manual via Render Shell
1. Go to Render Dashboard
2. Find your service
3. Click "Shell" tab
4. Run:
```bash
npx prisma migrate deploy
```

### Option 3: Update Build Command
If migrations aren't running automatically:

1. Go to Render Dashboard
2. Find your service → Settings
3. Update "Build Command" to:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```
4. Save and redeploy

## What the Migration Does

```sql
-- Adds yasbelaType column to Group table
ALTER TABLE "Group" ADD COLUMN IF NOT EXISTS "yasbelaType" TEXT;

-- Updates existing YASBELA groups with default type
UPDATE "Group" SET "yasbelaType" = 'NO_PAYMENT' 
WHERE status = 'YASBELA' AND "yasbelaType" IS NULL;
```

## Verify Migration Success

After deployment, check:
1. ✅ Server starts without errors
2. ✅ Groups page loads
3. ✅ Bidders page loads
4. ✅ Can apply yasbela with type selection

## Troubleshooting

### If migration fails:
1. Check Render logs for error messages
2. Verify DATABASE_URL is set correctly
3. Try running migration manually via Shell

### If 500 errors persist:
1. Check server logs on Render
2. Look for Prisma errors
3. Verify all routes are registered in server.js

## Expected Result

After successful migration:
- ✅ No more 500 errors
- ✅ Groups load correctly
- ✅ Bidders load correctly
- ✅ Yasbela type selection works
- ✅ Yasbela letters generate with correct content

## Files Changed
- `prisma/migrations/20250202000000_add_yasbela_type/migration.sql`
- `src/routes/yasbella.js` (new)
- `src/routes/group.js` (updated)
- `src/routes/export.js` (updated)
- `src/server.js` (updated)
