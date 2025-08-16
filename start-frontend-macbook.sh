#!/bin/bash

# Start Frontend on MacBook

echo "🎨 Starting Frontend on MacBook"

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

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend development server
echo "🚀 Starting frontend development server on port 8081..."
echo "📱 Frontend: http://$LOCAL_IP:8081"
echo ""
echo "Press Ctrl+C to stop the server"

npm run dev
