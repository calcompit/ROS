#!/bin/bash

# Start Backend on Windows via SSH
echo "🚀 Starting Backend on Windows via SSH..."
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
WINDOWS_PASSWORD="010138259"
PROJECT_PATH="C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
BACKEND_PATH="$PROJECT_PATH/backend"

echo "📋 Configuration:"
echo "   Windows Host: $WINDOWS_HOST"
echo "   Project Path: $PROJECT_PATH"
echo "   Backend Path: $BACKEND_PATH"
echo ""

# Function to run SSH command with password
run_ssh_with_password() {
    local command="$1"
    sshpass -p "$WINDOWS_PASSWORD" ssh -o StrictHostKeyChecking=no "$WINDOWS_HOST" "$command"
}

echo "🔍 Checking if backend is already running..."
run_ssh_with_password "cd $BACKEND_PATH && netstat -an | findstr :3001" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backend is already running on port 3001"
    echo "🌐 Backend URL: https://10.51.101.49:3001"
    echo "🔗 Health Check: https://10.51.101.49:3001/health"
    exit 0
fi

echo "📦 Installing dependencies..."
run_ssh_with_password "cd $BACKEND_PATH && npm install"

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "🚀 Starting backend server..."
echo "   This will run in the background on Windows"
echo "   Backend will be available at: https://10.51.101.49:3001"
echo ""

# Start backend in background on Windows
run_ssh_with_password "cd $BACKEND_PATH && nohup npm start > backend.log 2>&1 &"

if [ $? -eq 0 ]; then
    echo "✅ Backend started successfully!"
    echo ""
    echo "⏱️  Waiting for backend to be ready..."
    sleep 5
    
    # Test backend health
    echo "🧪 Testing backend health..."
    if curl -k -s https://10.51.101.49:3001/health > /dev/null; then
        echo "✅ Backend is responding!"
        echo "🌐 Backend URL: https://10.51.101.49:3001"
        echo "🔗 Health Check: https://10.51.101.49:3001/health"
        echo "📊 API: https://10.51.101.49:3001/api"
    else
        echo "⚠️  Backend may still be starting up..."
        echo "   Please wait a moment and try again"
    fi
else
    echo "❌ Failed to start backend"
    exit 1
fi
