#!/bin/bash
echo "🔄 Pulling latest code to Windows server..."
sshpass -p '010138259' ssh -i backend/ssl/id_rsa -o StrictHostKeyChecking=no dell-pc@10.51.101.49 "cd C:\\Users\\Dell-PC\\OneDrive\\Documents\\fixit-bright-dash-main && git fetch origin && git reset --hard origin/main"
echo "✅ Pull completed!"
