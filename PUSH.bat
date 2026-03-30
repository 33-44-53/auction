@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     PUSH CHANGES TO GITHUB - AUCTION REPOSITORY            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Repository: https://github.com/33-44-53/auction
echo.
echo This will push all deployment configuration changes.
echo.
pause
echo.

cd /d "%~dp0"

echo [1/4] Adding all changes...
git add .
if errorlevel 1 goto :error

echo.
echo [2/4] Committing changes...
git commit -m "Add deployment configs: Vercel, Render, Neon PostgreSQL"
if errorlevel 1 (
    echo No changes to commit.
    pause
    exit /b 0
)

echo.
echo [3/4] Pulling latest changes...
git pull origin main --rebase
if errorlevel 1 echo Warning: Pull failed, continuing...

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if errorlevel 1 goto :error

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SUCCESS!                                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Changes pushed to: https://github.com/33-44-53/auction
echo.
echo Next steps:
echo   1. Deploy to Neon (Database)
echo   2. Deploy to Render (Backend)
echo   3. Deploy to Vercel (Frontend)
echo.
echo See DEPLOYMENT.md for complete guide.
echo.
pause
exit /b 0

:error
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ERROR!                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Push failed. Please run manually:
echo.
echo   cd c:\Users\Oumer\Desktop\auction
echo   git add .
echo   git commit -m "Add deployment configs"
echo   git push origin main
echo.
pause
exit /b 1
