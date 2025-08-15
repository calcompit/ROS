@echo off
echo ========================================
echo   Pull and Run Backend Script
echo ========================================
echo.

echo [1/4] Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [2/4] Pulling latest code from git...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to pull from git
    pause
    exit /b 1
)
echo Successfully pulled latest code
echo.

echo [3/4] Installing dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

echo [4/4] Starting backend server...
echo Backend server is starting...
echo.
echo Server will be available at:
echo - HTTPS: https://localhost:3001
echo - Health check: https://localhost:3001/health
echo - API: https://localhost:3001/api
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm start
