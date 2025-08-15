# Development Setup - Distributed Environment

## Overview
This setup runs the frontend on MacBook and backend on Windows machine via SSH.

## Architecture
- **Frontend**: MacBook (http://localhost:8082)
- **Backend**: Windows via SSH (https://localhost:3001)

## Quick Start

### 1. Start Frontend (MacBook)
```bash
npm run dev
```
Frontend will be available at: http://localhost:8082

### 2. Start Backend (Windows via SSH)
```bash
./start-backend-windows.sh
```
This script will:
- Connect to Windows machine via SSH
- Pull latest code from git
- Install dependencies
- Start backend server

Backend will be available at: https://localhost:3001 (on Windows)

## Development Workflow

### Frontend Changes (MacBook)
1. Make changes to frontend code
2. Changes are automatically reflected (hot reload)
3. Commit and push when ready:
```bash
git add .
git commit -m "Frontend changes"
git push
```

### Backend Changes (MacBook → Windows)
1. Make changes to backend code on MacBook
2. Use sync script to automatically deploy:
```bash
./sync-backend-changes.sh
```

Or manually:
```bash
git add backend/
git commit -m "Backend changes"
git push
# Then SSH to Windows and pull/restart
```

### Manual Backend Sync
If you need to manually sync backend changes:
```bash
# Commit and push changes
git add backend/
git commit -m "Backend changes"
git push

# SSH to Windows and restart
ssh dell-pc@10.51.101.49
cd "C:/Users/Dell-PC/OneDrive/Documents/fixit-bright-dash-main"
git pull origin main
cd backend
npm start
```

## Scripts

### `start-backend-windows.sh`
- Connects to Windows via SSH
- Pulls latest code
- Installs dependencies
- Starts backend server

### `sync-backend-changes.sh`
- Detects backend changes
- Commits and pushes to git
- Pulls and restarts on Windows

### `pull-and-run-backend.bat` / `pull-and-run-backend.ps1`
- Windows scripts for local development
- Pulls code and starts backend

## Configuration

### SSH Setup
Make sure SSH key is configured for Windows access:
```bash
ssh dell-pc@10.51.101.49
```

### Environment Variables
- Frontend API URL: Configured to use Windows backend
- Backend Database: Configured for Windows SQL Server

## Troubleshooting

### SSH Connection Issues
1. Check SSH key setup
2. Verify Windows machine is accessible
3. Ensure SSH service is running on Windows

### Backend Issues
1. Check database connection on Windows
2. Verify port 3001 is available
3. Check Windows firewall settings

### Frontend Issues
1. Verify API URL configuration
2. Check CORS settings
3. Ensure backend is running on Windows

## Monitoring

### Health Checks
- Frontend: http://localhost:8082
- Backend: https://localhost:3001/health

### Logs
- Frontend: Check terminal where `npm run dev` is running
- Backend: Check SSH terminal or Windows console

## Database
- SQL Server running on Windows
- Connection string configured for Windows environment
- Demo mode available when database is unavailable
