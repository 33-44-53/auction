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

# Run migrations (this will handle existing data properly)
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "✅ Deployment complete!"
