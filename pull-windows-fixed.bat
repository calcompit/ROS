@echo off
echo Pulling latest code from Git...
cd /d "C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main"

REM Disable credential manager temporarily
git config --global credential.helper ""
git config --global --unset credential.helper

REM Fetch and pull
git fetch origin
git reset --hard origin/main

echo Pull completed!
echo Current commit: 
git log --oneline -1
pause
