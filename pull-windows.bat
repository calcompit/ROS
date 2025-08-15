@echo off
echo Pulling latest code from Git...
cd /d "C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main"
git config --global credential.helper store
git pull origin main
echo Pull completed!
pause
