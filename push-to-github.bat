@echo off
setlocal enabledelayedexpansion

title Push to GitHub - Auction Project

color 0A
cls

echo.
echo ========================================
echo   PUSH CHANGES TO GITHUB
echo ========================================
echo.
echo Repository: https://github.com/33-44-53/auction
echo.
echo Press any key to start...
pause >nul

set GIT="C:\Program Files\Git\bin\git.exe"

if not exist %GIT% (
    color 0C
    echo.
    echo ERROR: Git not found at: %GIT%
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 1/4] Checking repository status...
echo.
%GIT% status
if errorlevel 1 (
    color 0C
    echo.
    echo ERROR: Not a git repository or git command failed
    echo.
    pause
    exit /b 1
)

echo.
echo [Step 2/4] Adding all files...
echo.
%GIT% add .
if errorlevel 1 (
    color 0C
    echo ERROR: Failed to add files
    pause
    exit /b 1
)

echo.
echo [Step 3/4] Committing changes...
echo.
%GIT% commit -m "Add deployment configs: Vercel, Render, Neon PostgreSQL"
if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed
    echo.
    pause
    exit /b 0
)

echo.
echo [Step 4/4] Pushing to GitHub...
echo.
%GIT% push origin main
if errorlevel 1 (
    color 0E
    echo.
    echo WARNING: Push failed. Trying to pull and push again...
    echo.
    %GIT% pull origin main --rebase
    %GIT% push origin main
    if errorlevel 1 (
        color 0C
        echo.
        echo ERROR: Push still failed!
        echo.
        echo Please check:
        echo - Internet connection
        echo - GitHub credentials
        echo - Repository access
        echo.
        pause
        exit /b 1
    )
)

color 0A
echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Changes pushed to: https://github.com/33-44-53/auction
echo.
echo Next steps:
echo 1. Deploy to Neon (Database)
echo 2. Deploy to Render (Backend)
echo 3. Deploy to Vercel (Frontend)
echo.
echo See DEPLOYMENT.md for complete guide
echo.
echo Press any key to exit...
pause >nul
