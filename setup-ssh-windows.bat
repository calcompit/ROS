@echo off
chcp 65001 >nul

echo 🔑 Setting up SSH Server on Windows
echo ====================================
echo ""

echo 📋 This script will:
echo "   1. Install OpenSSH Server (if not installed)"
echo "   2. Configure SSH server"
echo "   3. Create SSH directory and set permissions"
echo "   4. Enable SSH service"
echo ""

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ This script must be run as Administrator
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo 🔍 Checking OpenSSH Server installation...

REM Check if OpenSSH Server is installed
powershell -Command "Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'" | findstr "Installed" >nul
if %errorLevel% neq 0 (
    echo 📦 Installing OpenSSH Server...
    powershell -Command "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0"
    if %errorLevel% neq 0 (
        echo ❌ Failed to install OpenSSH Server
        pause
        exit /b 1
    )
    echo ✅ OpenSSH Server installed successfully!
) else (
    echo ✅ OpenSSH Server is already installed
)

echo ""
echo 🔧 Configuring SSH Server...

REM Create SSH directory if it doesn't exist
if not exist "%USERPROFILE%\.ssh" (
    mkdir "%USERPROFILE%\.ssh"
    echo ✅ Created SSH directory
)

REM Set permissions on SSH directory
echo 🔐 Setting SSH directory permissions...
icacls "%USERPROFILE%\.ssh" /inheritance:r /grant:r "%USERNAME%:(F)" >nul 2>&1

REM Create authorized_keys file if it doesn't exist
if not exist "%USERPROFILE%\.ssh\authorized_keys" (
    echo. > "%USERPROFILE%\.ssh\authorized_keys"
    echo ✅ Created authorized_keys file
)

REM Set permissions on authorized_keys
icacls "%USERPROFILE%\.ssh\authorized_keys" /inheritance:r /grant:r "%USERNAME%:(F)" >nul 2>&1

echo ""
echo 🚀 Starting SSH Service...

REM Start SSH service
powershell -Command "Start-Service sshd"
if %errorLevel% equ 0 (
    echo ✅ SSH service started successfully!
) else (
    echo ❌ Failed to start SSH service
)

REM Set SSH service to start automatically
powershell -Command "Set-Service -Name sshd -StartupType 'Automatic'"
if %errorLevel% equ 0 (
    echo ✅ SSH service set to start automatically
)

echo ""
echo 🔥 Configuring Windows Firewall...

REM Allow SSH through Windows Firewall
powershell -Command "New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Firewall rule created for SSH
) else (
    echo ⚠️  Firewall rule may already exist
)

echo ""
echo 📋 SSH Server Configuration Complete!
echo ""
echo 🔑 To add MacBook's public key:"
echo "   1. Copy the public key from MacBook"
echo "   2. Add it to: %USERPROFILE%\.ssh\authorized_keys"
echo "   3. Or run: echo 'PUBLIC_KEY_HERE' >> %USERPROFILE%\.ssh\authorized_keys"
echo ""
echo 🌐 SSH Server is now running on port 22
echo 💻 MacBook can connect using: ssh dell-pc@10.51.101.49
echo ""
echo 🧪 Testing SSH service...
powershell -Command "Test-NetConnection -ComputerName localhost -Port 22" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ SSH service is responding on port 22
) else (
    echo ❌ SSH service is not responding on port 22
)

echo ""
echo 🎉 SSH Server setup completed!
pause
