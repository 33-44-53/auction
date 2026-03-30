@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: add vercel.json to frontend for SPA routing"
"C:\Program Files\Git\bin\git.exe" push origin master
pause
