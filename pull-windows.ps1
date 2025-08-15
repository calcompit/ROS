Write-Host "Pulling latest code from Git..." -ForegroundColor Green
Set-Location "C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main"
git config --global credential.helper store
git pull origin main
Write-Host "Pull completed!" -ForegroundColor Green
Read-Host "Press Enter to continue"
