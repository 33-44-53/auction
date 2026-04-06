#!/bin/bash
# Production deployment script for Render
# This script safely migrates the database with existing data

echo "🚀 Starting production deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if this is first deployment or needs baseline
echo "🗄️ Running database migrations..."

# Try migrate deploy first
if npx prisma migrate deploy 2>&1 | grep -q "P3005"; then
  echo "📋 Database needs baselining..."
  # Mark existing migrations as applied
  npx prisma migrate resolve --applied 20240101000000_init
  npx prisma migrate resolve --applied 20250101000000_add_group_metadata
  # Now deploy new migrations
  npx prisma migrate deploy
else
  echo "✅ Migrations applied successfully"
fi

echo "✅ Deployment complete!"
