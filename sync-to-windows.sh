#!/bin/bash

# Sync code to Windows via Git
# This script pushes changes to Git and optionally triggers pull on Windows via SSH

echo "🔄 Syncing code to Windows..."
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
WINDOWS_PASSWORD="010138259"
WINDOWS_PROJECT_PATH="C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git first."
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status --porcelain

# Ask user if they want to commit changes
echo ""
read -p "🤔 Do you want to commit and push changes? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add all changes
    echo "📝 Adding changes..."
    git add .
    
    # Get commit message
    echo ""
    read -p "💬 Enter commit message: " commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Manual sync: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "$commit_message"
    
    # Push to remote
    echo "🚀 Pushing to remote repository..."
    git push
    
    echo ""
    echo "✅ Code pushed successfully!"
    echo ""
    
    # Ask if user wants to trigger pull on Windows
    echo "🔗 Do you want to trigger pull on Windows via SSH?"
    read -p "🤔 Pull on Windows now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📡 Connecting to Windows and pulling changes..."
        
        # SSH to Windows and pull changes with password
        sshpass -p "$WINDOWS_PASSWORD" ssh -o StrictHostKeyChecking=no "$WINDOWS_HOST" << EOF
cd "$WINDOWS_PROJECT_PATH"
echo "📥 Pulling latest changes..."
git pull
echo "✅ Code updated on Windows!"
echo ""
echo "🚀 Restarting backend server..."
cd backend
npm start
EOF
        
        echo ""
        echo "✅ Windows updated and backend restarted!"
    else
        echo ""
        echo "📋 Manual steps on Windows:"
        echo "   1. Run: git pull"
        echo "   2. Run: start-backend-windows.bat"
        echo "   3. Or run: auto-pull-windows.bat (for auto monitoring)"
    fi
    
else
    echo "❌ Sync cancelled."
fi
