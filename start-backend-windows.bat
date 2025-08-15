@echo off
chcp 65001 >nul

echo 🚀 Starting Backend on Windows...
echo 📍 Port: 3001
echo 🌐 Tailscale IP: 10.51.101.49
echo 🔒 SSL: Enabled
echo ""

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Change to backend directory
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Set environment variables
set NODE_ENV=development
set PORT=3001
set TAILSCALE_IP=10.51.101.49

echo 🔧 Environment variables set:
echo    NODE_ENV=%NODE_ENV%
echo    PORT=%PORT%
echo    TAILSCALE_IP=%TAILSCALE_IP%
echo ""

echo 🌐 Starting Express server with SSL...
echo 📱 Backend will be available at: https://10.51.101.49:3001
echo 🔗 API Endpoint: https://10.51.101.49:3001/api
echo ""

echo Press Ctrl+C to stop the server
echo ""

npm run dev
