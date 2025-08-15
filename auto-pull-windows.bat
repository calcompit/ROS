@echo off
chcp 65001 >nul

echo 🔄 Auto Pull and Restart on Windows
echo ====================================
echo ""

REM Configuration
set PROJECT_PATH=C:\Users\Dell-PC\OneDrive\Documents\fixit-bright-dash-main
set CHECK_INTERVAL=30
set BACKEND_PORT=3001

echo 📁 Project path: %PROJECT_PATH%
echo ⏱️  Check interval: %CHECK_INTERVAL% seconds
echo 🚀 Backend port: %BACKEND_PORT%
echo ""

REM Check if we're in the correct directory
if not exist "%PROJECT_PATH%" (
    echo ❌ Project directory not found: %PROJECT_PATH%
    echo Please update PROJECT_PATH in this script
    pause
    exit /b 1
)

REM Change to project directory
cd /d "%PROJECT_PATH%"

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository. Please clone the repository first.
    pause
    exit /b 1
)

echo 🔍 Starting auto-pull monitor...
echo Press Ctrl+C to stop
echo ""

:loop
REM Check for updates
echo 📊 Checking for updates at %time%...
git fetch

REM Check if there are changes to pull
git status --porcelain >nul 2>&1
if errorlevel 0 (
    echo 📥 Changes detected, pulling updates...
    git pull
    
    echo ""
    echo ✅ Code updated successfully!
    echo ""
    echo 🚀 Restarting backend server...
    echo ""
    
    REM Kill existing backend process if running
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%BACKEND_PORT%') do (
        echo 🔄 Stopping existing backend process (PID: %%a)...
        taskkill /PID %%a /F >nul 2>&1
    )
    
    REM Wait a moment for process to stop
    timeout /t 2 /nobreak >nul
    
    REM Start the backend
    echo 🚀 Starting backend server...
    start "Backend Server" cmd /c "cd /d %PROJECT_PATH%\backend && npm start"
    
    echo ""
    echo ✅ Backend restarted successfully!
    echo 🌐 Backend will be available at: https://localhost:%BACKEND_PORT%
    echo ""
) else (
    echo ✅ No changes to pull.
)

REM Wait before next check
echo ⏱️  Waiting %CHECK_INTERVAL% seconds before next check...
timeout /t %CHECK_INTERVAL% /nobreak >nul
echo ""

goto loop
