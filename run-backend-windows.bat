@echo off
chcp 65001 >nul

echo 🚀 Starting Backend on Windows...
echo ================================
echo ""

cd /d "C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main\backend"

echo 📁 Current directory: %CD%
echo ""

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo ""

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorLevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo ""

REM Kill existing backend process if running
echo 🔄 Stopping existing backend process...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo ""

REM Start backend in background
echo 🚀 Starting backend server in background...
echo "   Backend will be available at: https://10.51.101.49:3001"
echo "   Health check: https://10.51.101.49:3001/health"
echo "   API: https://10.51.101.49:3001/api"
echo ""

start "Backend Server" cmd /c "npm start"

echo ✅ Backend started successfully!
echo ""
echo 💡 To stop the backend, close the Backend Server window
echo ""

pause
