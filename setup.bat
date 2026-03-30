@echo off
echo ========================================
echo Tender Management System - Setup
echo ========================================
echo.

if not exist .env (
    echo Creating .env file...
    (
        echo # Backend Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Database ^(Replace with your Neon PostgreSQL URL^)
        echo DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-secret-key-here-change-this
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # Upload Configuration
        echo UPLOAD_DIR=./uploads
        echo MAX_FILE_SIZE=50MB
        echo.
        echo # Frontend URL ^(for CORS^)
        echo FRONTEND_URL=http://localhost:5173
    ) > .env
    echo .env file created
) else (
    echo .env file already exists, skipping...
)

echo.
echo Installing backend dependencies...
call npm install

echo.
echo Setting up database...
call npx prisma generate
call npx prisma migrate deploy

echo.
echo Seeding database...
call npm run seed

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update DATABASE_URL in .env with your Neon connection string
echo 2. Run: npm run dev
echo 3. Setup frontend: cd frontend ^&^& npm install ^&^& npm run dev
echo.
pause
