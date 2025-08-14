@echo off
echo ========================================
echo    TechFix Pro - Windows Installation
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm is not installed!
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
)

echo.
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ ERROR: Failed to install dependencies!
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully
)

echo.
echo Creating SSL directory...
if not exist "ssl" mkdir ssl

echo.
echo Checking SSL certificates...
if not exist "ssl\key.pem" (
    echo ⚠️ SSL certificates not found!
    echo.
    echo Please run the following commands in Git Bash:
    echo cd ssl
    echo openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost"
    echo.
    echo After creating SSL certificates, run this script again.
    pause
    exit /b 1
) else (
    echo ✅ SSL certificates found
)

echo.
echo Checking .env file...
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo Please edit .env file with your database settings!
    echo.
    notepad .env
) else (
    echo ✅ .env file exists
)

echo.
echo Setting up Firewall...
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1
echo ✅ Firewall rule added

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your database settings
echo 2. Run: npm start
echo 3. Find your IP address: ipconfig
echo 4. Update Netlify Environment Variable
echo.
echo Press any key to continue...
pause >nul
