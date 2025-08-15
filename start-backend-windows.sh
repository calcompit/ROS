#!/bin/bash

# Start Backend on Windows via SSH with Auto Sync
echo "========================================"
echo "  Starting Backend on Windows"
echo "========================================"
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
PROJECT_PATH="C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
PASSWORD="010138259"

echo "[1/5] Checking SSH connection..."
if ! sshpass -p "$PASSWORD" ssh -o ConnectTimeout=5 "$WINDOWS_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ ERROR: Cannot connect to Windows machine"
    echo "Please check:"
    echo "- Password is correct"
    echo "- Windows machine is accessible at $WINDOWS_HOST"
    echo "- SSH service is running on Windows"
    exit 1
fi
echo "✅ SSH connection successful"
echo ""

echo "[2/5] Stopping existing backend processes..."
sshpass -p "$PASSWORD" ssh "$WINDOWS_HOST" << 'EOF'
echo "Stopping existing Node.js processes on port 3001..."
taskkill /f /im node.exe 2>nul || echo "No existing Node.js processes found"
echo "Port cleanup completed"
EOF
echo "✅ Existing processes stopped"
echo ""

echo "[3/5] Pulling latest code on Windows..."
sshpass -p "$PASSWORD" ssh "$WINDOWS_HOST" << 'EOF'
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
echo "Current directory: $(pwd)"
echo "Pulling latest code from git..."
git pull origin main
echo "Git pull completed"
EOF

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to pull code on Windows"
    exit 1
fi
echo "✅ Successfully pulled latest code"
echo ""

echo "[4/5] Installing dependencies on Windows..."
sshpass -p "$PASSWORD" ssh "$WINDOWS_HOST" << 'EOF'
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main/backend"
echo "Installing dependencies..."
npm install
echo "Dependencies installation completed"
EOF

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies on Windows"
    exit 1
fi
echo "✅ Dependencies installed successfully"
echo ""

echo "[5/5] Starting backend server on Windows..."
echo "Backend server is starting on Windows..."
echo ""
echo "Server will be available at:"
echo "- HTTPS: https://localhost:3001 (on Windows)"
echo "- Health check: https://localhost:3001/health"
echo "- API: https://localhost:3001/api"
echo ""
echo "Frontend is running on MacBook at:"
echo "- http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start backend on Windows
sshpass -p "$PASSWORD" ssh "$WINDOWS_HOST" << 'EOF'
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main/backend"
echo "Starting backend server..."
npm start
EOF
