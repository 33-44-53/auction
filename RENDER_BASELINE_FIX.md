# Render Deployment Fix - Database Baseline Required

## Problem
The database already has data and migration history. Prisma needs to baseline the existing migrations before applying new ones.

Error: `P3005 - The database schema is not empty`

## Solution: Update Build Command with Baseline

### Go to Render Dashboard and Update Build Command

1. Visit https://dashboard.render.com
2. Select your `auction-backend` service
3. Go to **Settings** → **Build & Deploy**
4. Replace **Build Command** with:

```bash
npm install && npx prisma generate && npx prisma migrate resolve --applied 20240101000000_init || true && npx prisma migrate resolve --applied 20250101000000_add_group_metadata || true && npx prisma migrate deploy
```

5. Click **Save Changes**
6. Click **Manual Deploy** → **Deploy latest commit**

## What This Does

1. **Install dependencies**: `npm install`
2. **Generate Prisma Client**: `npx prisma generate`
3. **Baseline existing migrations**: Mark old migrations as already applied
   - `20240101000000_init` - Initial schema
   - `20250101000000_add_group_metadata` - Group metadata
4. **Deploy new migration**: `20250201000000_add_created_by` - RBAC implementation

The `|| true` ensures the command continues even if migrations are already marked as applied.

## Why Baseline is Needed

Your production database was created with `prisma db push`, not migrations. Now we're switching to proper migrations for the RBAC feature. Baselining tells Prisma: "These migrations are already applied, skip them and only run new ones."

## Verify Success

After deployment succeeds, check:
1. ✅ Build logs show: "Applying migration `20250201000000_add_created_by`"
2. ✅ No P3005 errors
3. ✅ Service starts successfully
4. ✅ API responds at your Render URL

## Test RBAC

Once deployed:
1. Login as admin: `admin@tender.com` / `admin123`
   - Should see all existing tenders and bidders
2. Login as staff: `staff@tender.com` / `staff123`
   - Should see empty dashboard (no data)
3. Create tender as staff
   - Should only be visible to that staff user
4. Admin should see both admin and staff tenders

## Alternative: Manual SQL Approach

If the above doesn't work, you can manually baseline via Render Shell:

1. Go to your service → **Shell** tab
2. Run:
```bash
npx prisma migrate resolve --applied 20240101000000_init
npx prisma migrate resolve --applied 20250101000000_add_group_metadata
npx prisma migrate deploy
```

## Database State After Migration

- All existing tenders → `createdBy = 1` (admin)
- All existing bidders → `createdBy = 1` (admin)
- New staff users → Start with empty workspace
- Complete data isolation enforced
