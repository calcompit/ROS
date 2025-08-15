# Mac-Windows Development Setup Guide

ระบบการพัฒนาแบบกระจายระหว่าง MacBook (Frontend) และ Windows (Backend) ผ่าน Tailscale

## 🏗️ Architecture

```
MacBook (Frontend)          Windows (Backend)
     |                           |
     |-- Port 8081              |-- Port 3001
     |-- React + Vite           |-- Node.js + Express
     |-- Local Development      |-- SSL + Database
     |                           |
     └─── Tailscale Network ────┘
           (10.51.101.49)
```

## 📋 Prerequisites

### MacBook Requirements
- Node.js 18+ 
- npm
- Tailscale
- Git
- fswatch (for file watching - optional)

### Windows Requirements
- Node.js 18+
- npm
- Tailscale
- Git
- OpenSSH Server
- SQL Server (สำหรับ Database)

## 🚀 Quick Setup

### 1. Setup Tailscale
1. ติดตั้ง Tailscale บนทั้ง MacBook และ Windows
2. เชื่อมต่อทั้งสองเครื่องเข้ากับ Tailscale network เดียวกัน
3. ตรวจสอบ IP ของ Windows: `tailscale ip -4`

### 2. Setup SSH Connection (One-time)

#### บน MacBook:
```bash
chmod +x setup-ssh-mac.sh
./setup-ssh-mac.sh
```

#### บน Windows (Run as Administrator):
```cmd
setup-ssh-windows.bat
```

### 3. Setup Environment Files

#### บน MacBook:
```bash
cp env.macbook.example .env.local
# แก้ไข .env.local ตาม Tailscale IP ของ Windows
```

#### บน Windows:
```cmd
copy env.windows.example .env
# แก้ไข .env ตาม Tailscale IP ของ Windows
```

## 🚀 Daily Development Workflow

### Start Backend (Windows)
```cmd
# เปิด Command Prompt ที่ Windows
auto-pull-windows.bat
```

### Start Frontend (MacBook)
```bash
# เปิด Terminal ที่ MacBook
chmod +x start-frontend-mac.sh
./start-frontend-mac.sh
```

### Sync Code Changes (MacBook)
```bash
# เมื่อแก้ไขโค้ดเสร็จแล้ว
chmod +x sync-to-windows.sh
./sync-to-windows.sh
```

## 📁 Scripts Overview

### MacBook Scripts
- `start-frontend-mac.sh` - รัน Frontend ที่ port 8081
- `sync-to-windows.sh` - Push code ไป Git และ sync ไป Windows
- `setup-ssh-mac.sh` - ตั้งค่า SSH connection

### Windows Scripts
- `start-backend-windows.bat` - รัน Backend ที่ port 3001
- `auto-pull-windows.bat` - Pull code จาก Git และ restart backend
- `setup-ssh-windows.bat` - ตั้งค่า SSH server

## 🔄 Development Workflow

### เมื่อแก้ไข Frontend (MacBook)
1. แก้ไข code ใน `src/` directory
2. Frontend จะ auto-reload ที่ port 8081

### เมื่อแก้ไข Backend (MacBook)
1. แก้ไข code ใน `backend/` directory
2. รัน `./sync-to-windows.sh` เพื่อ push ไป Git
3. เลือก "y" เพื่อ trigger pull บน Windows

### เมื่อแก้ไข Backend (Windows)
1. แก้ไข code ใน `backend/` directory
2. รัน `auto-pull-windows.bat` เพื่อ pull และ restart

## 🌐 URLs

### Development URLs
- **Frontend**: http://localhost:8081
- **Backend API**: https://10.51.101.49:3001/api
- **Backend Health**: https://10.51.101.49:3001/health

### Environment Variables
```bash
# MacBook (.env.local)
VITE_API_URL=https://10.51.101.49:3001/api
VITE_WS_URL=wss://10.51.101.49:3001
VITE_APP_ENV=development

# Windows (.env)
NODE_ENV=development
PORT=3001
TAILSCALE_IP=10.51.101.49
```

## 🔧 Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh windows-backend "echo 'Connection successful'"
```

### Port Issues
- Frontend port 8081 ถูกใช้งาน: เปลี่ยนใน `vite.config.ts`
- Backend port 3001 ถูกใช้งาน: เปลี่ยนใน `backend/server.js`

### SSL Issues
- Backend ใช้ self-signed certificate
- Frontend จะ ignore SSL warnings ใน development mode

## 📊 Monitoring

### Frontend Logs
- ดู logs ใน Terminal ที่รัน `start-frontend-mac.sh`
- Browser Developer Tools Console

### Backend Logs
- ดู logs ใน Command Prompt ที่รัน `auto-pull-windows.bat`
- ตรวจสอบ database connection logs

## 🔒 Security Notes

- Tailscale IP (10.51.101.49) ใช้สำหรับ development เท่านั้น
- Production ควรใช้ proper domain และ SSL certificates
- Database credentials ควรอยู่ใน environment variables

## 📝 Notes

- กราฟจะใช้ข้อมูลจริงจาก database ที่ Windows
- WebSocket connection สำหรับ real-time updates
- Auto-reload เมื่อมีการแก้ไข code
- Git sync แบบ manual ผ่าน `sync-to-windows.sh`
