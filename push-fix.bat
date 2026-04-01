@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: use npx vite build for Vercel"
"C:\Program Files\Git\bin\git.exe" push origin master
pause
