#!/bin/bash

# SSH to Windows and Run Backend Script
echo "========================================"
echo "  SSH to Windows and Run Backend"
echo "========================================"
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
PROJECT_PATH="C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"

echo "[1/3] Connecting to Windows machine..."
echo "Host: $WINDOWS_HOST"
echo "Project path: $PROJECT_PATH"
echo ""

echo "[2/3] Pulling latest code and starting backend..."
echo "This will:"
echo "- SSH to Windows machine"
echo "- Navigate to project directory"
echo "- Pull latest code from git"
echo "- Install dependencies"
echo "- Start backend server"
echo ""

echo "[3/3] Starting SSH session..."
echo "========================================"
echo ""

# SSH command to run on Windows
ssh "$WINDOWS_HOST" << 'EOF'
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
echo "Current directory: $(pwd)"
echo ""
echo "Pulling latest code from git..."
git pull origin main
echo ""
echo "Installing dependencies..."
cd backend
npm install
echo ""
echo "Starting backend server..."
echo "Server will be available at:"
echo "- HTTPS: https://localhost:3001"
echo "- Health check: https://localhost:3001/health"
echo "- API: https://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
npm start
EOF
