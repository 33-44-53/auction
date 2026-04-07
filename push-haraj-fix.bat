@echo off
echo ========================================
echo Pushing Haraj Next Round Button Fix
echo ========================================
echo.

cd /d "c:\Users\Oumer\Desktop\auction"

echo Adding changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Add Next Round button for HARAJ groups - Button now appears for HARAJ rounds to allow progression through multiple Haraj rounds"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Push completed successfully!
echo ========================================
pause
