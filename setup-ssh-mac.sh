#!/bin/bash

# Setup SSH for MacBook to Windows connection
echo "🔑 Setting up SSH connection from MacBook to Windows"
echo "===================================================="
echo ""

# Configuration
WINDOWS_HOST="dell-pc@10.51.101.49"
WINDOWS_PROJECT_PATH="/c/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
SSH_KEY_NAME="macbook_to_windows"

echo "📋 Configuration:"
echo "   Windows Host: $WINDOWS_HOST"
echo "   Project Path: $WINDOWS_PROJECT_PATH"
echo "   SSH Key: ~/.ssh/$SSH_KEY_NAME"
echo ""

# Check if SSH key already exists
if [ -f ~/.ssh/$SSH_KEY_NAME ]; then
    echo "⚠️  SSH key already exists: ~/.ssh/$SSH_KEY_NAME"
    read -p "🤔 Do you want to overwrite it? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ SSH setup cancelled."
        exit 1
    fi
fi

# Create SSH directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Generate SSH key pair
echo "🔑 Generating SSH key pair..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/$SSH_KEY_NAME -N "" -C "macbook-to-windows-$(date '+%Y%m%d')"

if [ $? -eq 0 ]; then
    echo "✅ SSH key generated successfully!"
else
    echo "❌ Failed to generate SSH key."
    exit 1
fi

# Set proper permissions
chmod 600 ~/.ssh/$SSH_KEY_NAME
chmod 644 ~/.ssh/$SSH_KEY_NAME.pub

# Create SSH config
echo "📝 Creating SSH config..."
cat > ~/.ssh/config << EOF
# Windows Backend Server
Host windows-backend
    HostName 10.51.101.49
    User dell-pc
    IdentityFile ~/.ssh/$SSH_KEY_NAME
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF

chmod 600 ~/.ssh/config

echo "✅ SSH config created!"

# Display public key
echo ""
echo "🔑 Public key (copy this to Windows ~/.ssh/authorized_keys):"
echo "============================================================"
cat ~/.ssh/$SSH_KEY_NAME.pub
echo "============================================================"
echo ""

echo "📋 Next steps on Windows:"
echo "   1. Open PowerShell as Administrator"
echo "   2. Create SSH directory: mkdir -p ~/.ssh"
echo "   3. Add public key to authorized_keys:"
echo "      echo '$(cat ~/.ssh/$SSH_KEY_NAME.pub)' >> ~/.ssh/authorized_keys"
echo "   4. Set permissions: icacls ~/.ssh /inheritance:r /grant:r '%USERNAME%:(F)'"
echo "   5. Test connection from MacBook: ssh windows-backend"
echo ""

# Test connection
echo "🧪 Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes windows-backend "echo 'SSH connection successful!'" 2>/dev/null; then
    echo "✅ SSH connection test successful!"
else
    echo "⚠️  SSH connection test failed. Please complete the Windows setup first."
    echo "   You can test again later with: ssh windows-backend"
fi

echo ""
echo "🎉 SSH setup completed!"
echo "💡 You can now use 'ssh windows-backend' to connect to Windows"
