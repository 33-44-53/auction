@echo off
echo Deploying Yasbela Type Migration...
echo.

npx prisma migrate deploy

echo.
echo Migration deployed successfully!
echo.
echo Changes applied:
echo   - Added yasbelaType column to Group table
echo   - Updated existing YASBELA groups with default type
echo.
pause
