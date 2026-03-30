@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: correct migration_lock.toml format"
"C:\Program Files\Git\bin\git.exe" push origin master
pause
