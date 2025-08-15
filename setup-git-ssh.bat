@echo off
echo Setting up Git to use SSH instead of HTTPS...
cd /d "C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main"

REM Change remote URL to use SSH
git remote set-url origin git@github.com:calcompit/ROS.git

REM Disable credential manager
git config --global credential.helper ""

echo Git SSH setup completed!
echo Now you can pull without password prompts.
pause
