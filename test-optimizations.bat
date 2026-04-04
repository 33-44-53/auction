@echo off
REM Performance Optimization Test Script for Windows
REM Tests compression, pagination, and response times

echo ==========================================
echo Testing Performance Optimizations
echo ==========================================
echo.

set API_URL=https://auction-i5wc.onrender.com
set EMAIL=admin@tender.com
set PASSWORD=admin123

REM Test 1: Health Check
echo Test 1: Health Check ^& Compression
echo --------------------------------------
curl -I "%API_URL%/api/health"
echo.

REM Test 2: Login
echo Test 2: Authentication
echo --------------------------------------
curl -s -X POST "%API_URL%/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}" > login_response.json
echo Login response saved to login_response.json
type login_response.json
echo.

REM Extract token (manual step - copy token from login_response.json)
echo.
echo MANUAL STEP: Copy the token from login_response.json
echo Then run the following commands with your token:
echo.
echo curl "%API_URL%/api/tenders?page=1&limit=5" -H "Authorization: Bearer YOUR_TOKEN_HERE"
echo.
echo curl "%API_URL%/api/tenders?page=1&limit=20&details=true" -H "Authorization: Bearer YOUR_TOKEN_HERE"
echo.

pause
