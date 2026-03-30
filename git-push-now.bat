@echo off
setlocal

set GIT="C:\Program Files\Git\bin\git.exe"

echo Checking git status...
%GIT% status

echo.
echo Adding all files...
%GIT% add .

echo.
echo Committing changes...
%GIT% commit -m "Add deployment configs: Vercel, Render, Neon PostgreSQL"

echo.
echo Pushing to GitHub...
%GIT% push origin main

echo.
echo Done!
pause
