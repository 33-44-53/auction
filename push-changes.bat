@echo off
echo ========================================
echo Push Changes to GitHub
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Checking repository status...
echo.

REM Check if .git exists
if not exist .git (
    echo Initializing Git repository...
    git init
    git remote add origin https://github.com/33-44-53/auction.git
    git branch -M main
) else (
    echo Git repository already initialized.
)

echo.
echo ========================================
echo Current Changes:
echo ========================================
git status

echo.
echo ========================================
echo Adding all changes...
echo ========================================
git add .

echo.
echo ========================================
echo Creating commit...
echo ========================================
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update: Add deployment configurations for Vercel, Render, and Neon
)

git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Pushing to GitHub...
echo ========================================
echo.
echo Repository: https://github.com/33-44-53/auction
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo Push failed! Trying to pull first...
    echo ========================================
    git pull origin main --rebase
    echo.
    echo Retrying push...
    git push -u origin main
)

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Push still failed!
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify GitHub credentials
    echo 3. Make sure you have push access to the repository
    echo.
    echo Manual push command:
    echo git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Changes pushed to GitHub
echo ========================================
echo.
echo Repository: https://github.com/33-44-53/auction
echo.
echo Changes pushed:
echo - PostgreSQL database configuration
echo - Render deployment config (render.yaml)
echo - Vercel deployment config (vercel.json)
echo - Updated CORS settings
echo - Migration files for PostgreSQL
echo - Complete deployment documentation
echo.
echo Next steps:
echo 1. Setup Neon database
echo 2. Deploy backend to Render
echo 3. Deploy frontend to Vercel
echo.
echo See DEPLOYMENT.md for complete guide
echo.
pause
