# MacBook Setup Guide

คู่มือการตั้งค่าและใช้งาน FixIt Bright Dashboard บน MacBook (HTTP Mode)

## 🚀 Quick Start

### วิธีที่ 1: รันทั้ง Frontend และ Backend พร้อมกัน
```bash
./start-macbook-local.sh
```

### วิธีที่ 2: รันแยกกัน (แนะนำสำหรับการพัฒนา)

#### Terminal 1 - Backend
```bash
./start-backend-macbook.sh
```

#### Terminal 2 - Frontend
```bash
./start-frontend-macbook.sh
```

## 📁 URLs

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **WebSocket**: http://localhost:3001

## ⚙️ Environment Configuration

### Frontend (.env.local)
```bash
# API Configuration (HTTP for local development)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_ENV=development
```

### Backend (backend/.env)
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_TYPE=sqlite
DB_PATH=./demo-data.db

# JWT Configuration
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:8081
```

## 🔧 Troubleshooting

### Backend ไม่สามารถเริ่มได้
1. ตรวจสอบว่า port 3001 ไม่ถูกใช้งาน
```bash
lsof -i :3001
```

2. ตรวจสอบไฟล์ .env ใน backend folder
```bash
cat backend/.env
```

### Frontend ไม่สามารถเชื่อมต่อ Backend ได้
1. ตรวจสอบว่า Backend กำลังรันอยู่
```bash
curl http://localhost:3001/health
```

2. ตรวจสอบไฟล์ .env.local
```bash
cat .env.local
```

### WebSocket ไม่ทำงาน
1. ตรวจสอบว่าใช้ HTTP ไม่ใช่ HTTPS
2. ตรวจสอบ CORS settings ใน Backend
3. เปิด Developer Tools ใน Browser และดู Console

## 📝 Development Notes

- Backend ใช้ SQLite database สำหรับการพัฒนา
- WebSocket ทำงานผ่าน HTTP (ไม่ใช่ HTTPS)
- CORS อนุญาต localhost:8081 สำหรับ Frontend
- ระบบใช้ JWT สำหรับ Authentication

## 🛑 การหยุดการทำงาน

### วิธีที่ 1: รันพร้อมกัน
กด `Ctrl+C` ใน terminal ที่รันสคริปต์

### วิธีที่ 2: รันแยกกัน
กด `Ctrl+C` ในแต่ละ terminal

## 🔄 การ Restart

1. หยุดการทำงานทั้งหมด
2. รันสคริปต์ใหม่ตามต้องการ

## 📊 การทดสอบ WebSocket

1. เปิด Frontend ที่ http://localhost:8081
2. เปิด Developer Tools (F12)
3. ไปที่ Console tab
4. สร้างใบซ่อมใหม่หรือแก้ไขใบซ่อมที่มีอยู่
5. ดูการอัพเดทแบบ Real-time ใน Console
