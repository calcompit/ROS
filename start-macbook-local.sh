#!/bin/bash

# Start MacBook Local Development (HTTP)
# This script runs both Frontend and Backend on MacBook

echo "🚀 Starting FixIt Bright Dashboard on MacBook (HTTP Mode)"

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="10.13.10.41"  # Fallback IP
fi

echo "📍 Using IP address: $LOCAL_IP"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.macbook-local.example .env.local
    echo "✅ .env.local created. Please edit it if needed."
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env from template..."
    cp backend/env.example backend/.env
    echo "✅ backend/.env created. Please edit it if needed."
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping all processes..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Backend (HTTP mode)
echo "🔧 Starting Backend (HTTP) on port 3001..."
cd backend
npm install
node server-http.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://$LOCAL_IP:3001/health > /dev/null; then
    echo "❌ Backend failed to start. Check the logs above."
    cleanup
fi

echo "✅ Backend is running on http://$LOCAL_IP:3001"

# Start Frontend
echo "🎨 Starting Frontend on port 8081..."
npm install
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 FixIt Bright Dashboard is running!"
echo ""
echo "📱 Frontend: http://$LOCAL_IP:8081"
echo "🔧 Backend API: http://$LOCAL_IP:3001/api"
echo "🏥 Health Check: http://$LOCAL_IP:3001/health"
echo "🔌 WebSocket: http://$LOCAL_IP:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
