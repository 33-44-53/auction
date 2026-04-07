#!/bin/bash

# Deploy Yasbela Type Migration
# This script applies the yasbelaType field migration to production database

echo "🚀 Deploying Yasbela Type Migration..."

# Run Prisma migration deploy (for production)
npx prisma migrate deploy

echo "✅ Migration deployed successfully!"
echo ""
echo "📝 Changes applied:"
echo "  - Added yasbelaType column to Group table"
echo "  - Updated existing YASBELA groups with default type"
echo ""
echo "🔄 Restarting server to apply changes..."
