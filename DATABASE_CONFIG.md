# Database Configuration Guide

## Overview

This project uses **different databases** for different environments:
- **Local Development:** SQLite (file-based, simple)
- **Production (Render):** PostgreSQL (powerful, scalable)

---

## Current Setup

### Production (Render)
- **Provider:** PostgreSQL
- **Schema:** `prisma/schema.prisma` uses `provider = "postgresql"`
- **Database URL:** Automatically set by Render from connected database

### Local Development
- **Provider:** SQLite (for simplicity)
- **Database File:** `prisma/dev.db`
- **To use SQLite locally:** Update your `.env` file

---

## How to Switch Between Databases

### Option 1: Use SQLite Locally (Recommended for Development)

**Step 1:** Update your local `.env` file:
```env
DATABASE_URL=file:./prisma/dev.db
```

**Step 2:** Temporarily change `prisma/schema.prisma` (DON'T COMMIT):
```prisma
datasource db {
  provider = "sqlite"  // Change from postgresql
  url      = env("DATABASE_URL")
}
```

**Step 3:** Generate and push:
```bash
npx prisma generate
npx prisma db push
```

**Step 4:** Run your app:
```bash
npm run dev
```

**⚠️ IMPORTANT:** Don't commit the SQLite change to schema.prisma!

---

### Option 2: Use PostgreSQL Locally (Production-like)

**Step 1:** Install PostgreSQL locally
- Download from: https://www.postgresql.org/download/

**Step 2:** Create a database:
```bash
createdb auction_dev
```

**Step 3:** Update `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/auction_dev
```

**Step 4:** Run migrations:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

---

## Deployment Status

### ✅ Fixed Issues:
1. Schema now uses PostgreSQL for production
2. Migration lock file updated to PostgreSQL
3. Render will use PostgreSQL database automatically

### 🚀 Next Deployment:
The next Render deployment will:
- ✅ Use PostgreSQL (correct provider)
- ✅ Apply all performance indexes
- ✅ Install compression package
- ✅ Enable pagination

---

## Troubleshooting

### Error: "URL must start with protocol `file:`"
**Cause:** Using SQLite provider with PostgreSQL URL (or vice versa)

**Solution:** Make sure provider matches your DATABASE_URL:
- SQLite: `DATABASE_URL=file:./prisma/dev.db`
- PostgreSQL: `DATABASE_URL=postgresql://...`

### Error: "Provider mismatch in migration_lock.toml"
**Cause:** Switching between SQLite and PostgreSQL

**Solution:** 
```bash
# Delete migrations and start fresh (local only!)
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Local Development with SQLite
If you want to use SQLite locally while keeping PostgreSQL for production:

1. Keep schema.prisma with `provider = "postgresql"`
2. Use this DATABASE_URL locally: `file:./prisma/dev.db`
3. Prisma will auto-detect and use SQLite

---

## Performance Optimizations Applied

The schema includes these performance indexes:

### Tender Table:
- `status` (for filtering)
- `createdAt` (for sorting)
- `tenderNumber` (for searching)

### Group Table:
- `tenderId` (for joins)
- `status` (for filtering)
- `tenderId + status` (composite for common queries)

### Item Table:
- `groupId` (for joins)

### Bid Table:
- `groupId` (for joins)
- `bidderId` (for joins)

### AuditLog Table:
- `userId` (for filtering)
- `timestamp` (for sorting)
- `entity + entityId` (for lookups)

---

## Testing Database Performance

After deployment, run:
```bash
node test-optimizations.js
```

Expected results:
- ✅ Avg Query Time: < 500ms (with indexes)
- ✅ Login Time: < 2000ms
- ✅ Response Size: < 100KB (with compression)

---

## Production Checklist

- [x] Schema uses PostgreSQL
- [x] Migration lock uses PostgreSQL
- [x] Performance indexes added
- [x] Render build command includes `prisma db push`
- [ ] Render deployment successful
- [ ] Test optimizations applied

---

## Quick Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (no migrations)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Seed database
npm run seed
```

---

**Last Updated:** After PostgreSQL fix
**Commit:** e6b76098
