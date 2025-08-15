#!/bin/bash

# Start Frontend on MacBook
# This script runs the React frontend on port 8081

echo "🚀 Starting Frontend on MacBook..."
echo "📍 Port: 8081"
echo "🌐 Backend will connect to Windows via Tailscale IP: 10.51.101.49:3001"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables for development
export VITE_API_URL=https://10.51.101.49:3001/api
export VITE_WS_URL=ws://10.51.101.49:3002
export VITE_APP_ENV=development

echo "🔧 Environment variables set:"
echo "   VITE_API_URL=$VITE_API_URL"
echo "   VITE_WS_URL=$VITE_WS_URL"
echo "   VITE_APP_ENV=$VITE_APP_ENV"
echo ""

# Start the development server
echo "🌐 Starting Vite development server..."
echo "📱 Frontend will be available at: http://localhost:8081"
echo "🔗 Backend API: https://10.51.101.49:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
