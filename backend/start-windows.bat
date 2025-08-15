@echo off
echo Starting IT ROS Backend Server...
echo IP: 10.51.109.19
echo Port: 3001
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Create SSL directory if it doesn't exist
if not exist "ssl" (
    mkdir ssl
)

REM Check if SSL certificates exist
if not exist "ssl\key.pem" (
    echo SSL certificates not found. Creating self-signed certificates...
    echo Please make sure OpenSSL is installed on your system.
    echo.
    echo If OpenSSL is not installed, you can:
    echo 1. Download from https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Add OpenSSL to your PATH
    echo 3. Run this script again
    echo.
    pause
)

echo.
echo Starting server...
echo API will be available at: https://10.51.109.19:3001/api
echo Health check: https://10.51.109.19:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
