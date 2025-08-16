#!/bin/bash

# Environment switcher for frontend
# Usage: ./switch-env.sh [URL] [PORT]

# Default values
DEFAULT_PORT=3001
DEFAULT_ENV=development

# Get URL from argument or prompt user
if [ -n "$1" ]; then
    API_URL=$1
else
    echo "🌐 Enter your backend URL:"
    echo "   Examples:"
    echo "   - localhost"
    echo "   - 10.51.101.49"
    echo "   - 10.13.10.41"
    echo "   - wk-svr01.tail878f89.ts.net"
    echo ""
    read -p "URL: " API_URL
fi

# Get port from argument or use default
if [ -n "$2" ]; then
    PORT=$2
else
    read -p "Port (default: $DEFAULT_PORT): " PORT
    PORT=${PORT:-$DEFAULT_PORT}
fi

# Determine if it's HTTPS or HTTP
if [[ $API_URL == https://* ]]; then
    PROTOCOL="https"
    # Remove https:// prefix
    API_URL=${API_URL#https://}
elif [[ $API_URL == http://* ]]; then
    PROTOCOL="http"
    # Remove http:// prefix
    API_URL=${API_URL#http://}
else
    # Default to HTTP for local IPs, HTTPS for domains
    if [[ $API_URL == localhost ]] || [[ $API_URL =~ ^10\. ]] || [[ $API_URL =~ ^100\. ]] || [[ $API_URL =~ ^192\.168\. ]]; then
        PROTOCOL="http"
    else
        PROTOCOL="https"
    fi
fi

# Create .env.local file
echo "🔄 Creating .env.local with your settings..."
echo "VITE_API_URL=$PROTOCOL://$API_URL:$PORT/api" > .env.local
echo "VITE_WS_URL=$PROTOCOL://$API_URL:$PORT" >> .env.local
echo "VITE_APP_ENV=$DEFAULT_ENV" >> .env.local

echo ""
echo "✅ Environment configured!"
echo "📍 API URL: $PROTOCOL://$API_URL:$PORT/api"
echo "🔌 WebSocket URL: $PROTOCOL://$API_URL:$PORT"
echo "🌍 Protocol: $PROTOCOL"
echo ""
echo "📋 Current .env.local content:"
cat .env.local
echo ""
echo "🚀 Restart your frontend to apply changes:"
echo "   npm run dev"
