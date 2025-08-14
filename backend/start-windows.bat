@echo off
echo ========================================
echo    TechFix Pro Backend - Windows
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo Checking SSL certificates...
if not exist "ssl" (
    echo Creating SSL directory...
    mkdir ssl
)

if not exist "ssl\key.pem" (
    echo SSL certificates not found!
    echo.
    echo Please choose an option:
    echo 1. Install OpenSSL and generate certificates automatically
    echo 2. Use mkcert (recommended for development)
    echo 3. Generate certificates manually
    echo.
    set /p choice="Enter your choice (1-3): "
    
    if "%choice%"=="1" (
        echo Installing OpenSSL...
        echo Please install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
        echo Then run this script again.
        pause
        exit /b 1
    ) else if "%choice%"=="2" (
        echo Installing mkcert...
        echo Please install mkcert from https://github.com/FiloSottile/mkcert/releases
        echo Then run: mkcert -install
        echo And: mkcert localhost 127.0.0.1
        pause
        exit /b 1
    ) else if "%choice%"=="3" (
        echo Manual SSL setup required.
        echo Please run the following commands in Git Bash:
        echo cd ssl
        echo openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost"
        pause
        exit /b 1
    )
)

echo Checking .env file...
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please edit .env file with your database settings!
    echo.
    notepad .env
)

echo.
echo Starting TechFix Pro Backend...
echo.
echo Server will be available at:
echo - Local: https://localhost:3001
echo - Network: https://[YOUR_IP]:3001
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause
