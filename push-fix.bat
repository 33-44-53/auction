@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: clean PostgreSQL migrations"
"C:\Program Files\Git\bin\git.exe" push origin master
pause
