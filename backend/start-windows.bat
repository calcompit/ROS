@echo off
echo ========================================
echo    TechFix Pro Backend - Windows
echo ========================================
echo.

echo 🔄 Installing dependencies...
call npm install

echo.
echo 🚀 Starting backend server...
echo 📍 Backend will be available at:
echo    - Local: http://localhost:3001
echo    - Network: http://100.73.2.100:3001
echo    - Health check: http://localhost:3001/health
echo.

echo ⚠️  Make sure to update frontend to use:
echo    ./switch-env.sh 100.73.2.100 3001
echo.

node server-http.js

pause
