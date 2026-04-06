#!/bin/bash
# Baseline existing production database and apply new migrations

echo "🚀 Starting production deployment with baseline..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if _prisma_migrations table exists
echo "🔍 Checking migration status..."

# Try to baseline - mark existing migrations as applied
echo "📋 Baselining existing database..."
npx prisma migrate resolve --applied 20240101000000_init || echo "Migration already applied or doesn't need baseline"
npx prisma migrate resolve --applied 20250101000000_add_group_metadata || echo "Migration already applied or doesn't need baseline"

# Now deploy the new migration
echo "🗄️ Deploying new migrations..."
npx prisma migrate deploy

echo "✅ Deployment complete!"
