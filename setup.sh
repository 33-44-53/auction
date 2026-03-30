#!/bin/bash

echo "🚀 Tender Management System - Deployment Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Backend Configuration
PORT=3000
NODE_ENV=development

# Database (Replace with your Neon PostgreSQL URL)
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# JWT Configuration
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=24h

# Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate deploy

echo ""
echo "🌱 Seeding database..."
npm run seed

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL in .env with your Neon connection string"
echo "2. Run: npm run dev"
echo "3. Setup frontend: cd frontend && npm install && npm run dev"
