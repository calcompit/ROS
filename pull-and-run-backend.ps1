# Pull and Run Backend Script for PowerShell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pull and Run Backend Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking current directory..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Pulling latest code from git..." -ForegroundColor Yellow
try {
    git pull origin main
    if ($LASTEXITCODE -ne 0) {
        throw "Git pull failed"
    }
    Write-Host "Successfully pulled latest code" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to pull from git" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

Write-Host "[4/4] Starting backend server..." -ForegroundColor Yellow
Write-Host "Backend server is starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "- HTTPS: https://localhost:3001" -ForegroundColor White
Write-Host "- Health check: https://localhost:3001/health" -ForegroundColor White
Write-Host "- API: https://localhost:3001/api" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm start
