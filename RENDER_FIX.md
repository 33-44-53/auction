# Render Deployment Fix - Manual Steps Required

## Problem
Render is using a cached build command that uses `prisma db push` instead of `prisma migrate deploy`.

## Solution: Update Build Command in Render Dashboard

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Select your `auction-backend` service

### Step 2: Update Build Command
1. Click on **Settings** (left sidebar)
2. Scroll to **Build & Deploy** section
3. Find **Build Command** field
4. Replace the current command with:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
   OR use the deploy script:
   ```bash
   bash deploy.sh
   ```

### Step 3: Save and Redeploy
1. Click **Save Changes**
2. Go to **Manual Deploy** section
3. Click **Deploy latest commit**

## Why This Fix Works

**Old Command (Fails):**
```bash
prisma db push --accept-data-loss
```
- Tries to sync schema directly
- Cannot add required columns to tables with existing data
- Fails with error about `createdBy` field

**New Command (Works):**
```bash
prisma migrate deploy
```
- Runs the migration file: `20250201000000_add_created_by/migration.sql`
- Migration properly handles existing data:
  1. Adds `createdBy` as nullable
  2. Sets existing records to admin (user ID = 1)
  3. Makes column NOT NULL
  4. Adds foreign keys and indexes

## Alternative: Delete and Recreate Service

If updating the build command doesn't work:

1. **Backup your DATABASE_URL** from Render environment variables
2. Delete the `auction-backend` service
3. Create new service from GitHub repo
4. Render will read `render.yaml` with correct build command
5. Add back the DATABASE_URL environment variable

## Verify Deployment

After successful deployment, check:
1. Service logs show: "✅ Deployment complete!"
2. No migration errors
3. API is accessible at your Render URL
4. Login works with admin credentials

## Test the RBAC Implementation

Once deployed:
1. Login as admin: `admin@tender.com` / `admin123`
2. Login as staff: `staff@tender.com` / `staff123`
3. Verify staff sees empty dashboard
4. Verify admin sees all data
5. Create tender as staff, verify isolation

## Need Help?

If deployment still fails, check:
- Render service logs for detailed error messages
- Database connection (DATABASE_URL is correct)
- All migrations are in the repo
- PostgreSQL database is accessible
