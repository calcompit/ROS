#!/bin/bash

# Auto Sync Backend Changes to Windows
echo "========================================"
echo "  Auto Sync Backend Changes"
echo "========================================"
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
PROJECT_PATH="C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
PASSWORD="010138259"

# Function to sync changes
sync_changes() {
    echo "🔄 Syncing backend changes to Windows..."
    
    # Commit and push changes
    echo "📝 Committing changes..."
    git add backend/
    git commit -m "Backend changes - $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo "📤 Pushing to git..."
    git push origin main
    
    # Pull and restart on Windows
    echo "📥 Pulling and restarting on Windows..."
    sshpass -p "$PASSWORD" ssh "$WINDOWS_HOST" << 'EOF'
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
echo "Pulling latest changes..."
git pull origin main
echo "Restarting backend server..."
cd backend
npm start
EOF
    
    echo "✅ Sync completed!"
}

# Check if backend directory has changes
if git diff --quiet backend/; then
    echo "ℹ️  No backend changes detected"
else
    echo "🔍 Backend changes detected"
    sync_changes
fi

echo ""
echo "Usage:"
echo "  ./sync-backend-changes.sh  - Sync current changes"
echo "  git add backend/ && git commit -m 'message' && ./sync-backend-changes.sh  - Commit and sync"
echo ""
