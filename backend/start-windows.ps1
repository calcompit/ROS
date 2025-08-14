# TechFix Pro Backend - Windows PowerShell Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TechFix Pro Backend - Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm installation
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check dependencies
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Failed to install dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check SSL certificates
Write-Host "Checking SSL certificates..." -ForegroundColor Yellow
if (-not (Test-Path "ssl")) {
    Write-Host "Creating SSL directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "ssl" -Force | Out-Null
}

if (-not (Test-Path "ssl\key.pem")) {
    Write-Host "SSL certificates not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please choose an option:" -ForegroundColor Yellow
    Write-Host "1. Install OpenSSL and generate certificates automatically" -ForegroundColor White
    Write-Host "2. Use mkcert (recommended for development)" -ForegroundColor White
    Write-Host "3. Generate certificates manually" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host "Installing OpenSSL..." -ForegroundColor Yellow
            Write-Host "Please install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
            Write-Host "Then run this script again." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
        "2" {
            Write-Host "Installing mkcert..." -ForegroundColor Yellow
            Write-Host "Please install mkcert from https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Yellow
            Write-Host "Then run: mkcert -install" -ForegroundColor Yellow
            Write-Host "And: mkcert localhost 127.0.0.1" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
        "3" {
            Write-Host "Manual SSL setup required." -ForegroundColor Yellow
            Write-Host "Please run the following commands in Git Bash:" -ForegroundColor Yellow
            Write-Host "cd ssl" -ForegroundColor White
            Write-Host "openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost'" -ForegroundColor White
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
}

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env" -Force
    Write-Host ""
    Write-Host "Please edit .env file with your database settings!" -ForegroundColor Yellow
    Write-Host ""
    notepad ".env"
}

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "Starting TechFix Pro Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Cyan
Write-Host "- Local: https://localhost:3001" -ForegroundColor White
Write-Host "- Network: https://$localIP`:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm start
