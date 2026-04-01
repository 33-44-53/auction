@echo off
"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: tender Excel download button now downloads instead of navigating"
"C:\Program Files\Git\bin\git.exe" push origin master
pause
