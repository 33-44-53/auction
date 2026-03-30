@echo off
echo ========================================
echo Push to GitHub
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

echo Git is installed. Proceeding...
echo.

REM Get GitHub username and repo name
set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: tender-management-system): "

if "%REPO_NAME%"=="" set REPO_NAME=tender-management-system

echo.
echo Repository will be: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
set /p CONFIRM="Is this correct? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Step 1: Initializing Git repository...
echo ========================================
git init

echo.
echo ========================================
echo Step 2: Adding files...
echo ========================================
git add .

echo.
echo ========================================
echo Step 3: Creating commit...
echo ========================================
git commit -m "Initial commit: Tender Management System with deployment configs"

echo.
echo ========================================
echo Step 4: Adding remote repository...
echo ========================================
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo ========================================
echo Step 5: Renaming branch to main...
echo ========================================
git branch -M main

echo.
echo ========================================
echo Step 6: Pushing to GitHub...
echo ========================================
echo.
echo You may be prompted for GitHub credentials:
echo - Username: %GITHUB_USERNAME%
echo - Password: Use Personal Access Token (not your password)
echo.
echo Generate token at: https://github.com/settings/tokens
echo Required scope: repo (full control)
echo.
pause

git push -u origin main

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Common solutions:
    echo 1. Make sure the repository exists on GitHub
    echo 2. Check your credentials
    echo 3. Use Personal Access Token instead of password
    echo.
    echo Create repository at: https://github.com/new
    echo Generate token at: https://github.com/settings/tokens
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Repository URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Deploy backend to Render
echo 3. Deploy frontend to Vercel
echo.
echo See DEPLOYMENT.md for complete guide
echo.
pause
