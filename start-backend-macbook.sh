#!/bin/bash

# Start Backend on MacBook (HTTP Mode)

echo "🔧 Starting Backend on MacBook (HTTP Mode)"

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env from template..."
    cp backend/env.example backend/.env
    echo "✅ backend/.env created. Please edit it if needed."
fi

# Navigate to backend directory
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend server
echo "🚀 Starting backend server on port 3001..."
echo "📍 Health check: http://localhost:3001/health"
echo "🔌 WebSocket: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"

node server-http.js
