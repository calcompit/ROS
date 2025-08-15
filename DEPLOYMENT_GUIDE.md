# 🚀 IT ROS Deployment Guide

## 📋 Overview
IT ROS (Repair Order System) - Maintenance Management System ที่รองรับการ deploy บนเครื่องต่างๆ โดยอัตโนมัติ

## 🌐 Network Configuration

### ✅ รองรับ IP Range
- **10.x.x.x** - Local network IP range ทั้งหมด
- **localhost** - Development mode
- **Netlify** - Production deployment

### 🔧 Auto-Detection Features
- **Backend**: Detect local IP อัตโนมัติ
- **Frontend**: ใช้ hostname จาก browser
- **SSL Certificate**: สร้างตาม IP ที่ detect ได้
- **CORS**: อนุญาต 10.x.x.x ทั้งหมด

## 🖥️ Local Development

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
npm install
npm run dev
```

### URLs
- **Frontend**: `http://localhost:8081` (หรือ port อื่นที่ว่าง)
- **Backend**: `https://localhost:3001`
- **API Health**: `https://localhost:3001/health`

## 🌍 Network Deployment

### 1. Backend Server
```bash
# รันบนเครื่องใดก็ได้ใน network
cd backend
npm start
```

ระบบจะ:
- ✅ Detect IP อัตโนมัติ (เช่น 10.51.101.49, 10.13.12.36, etc.)
- ✅ สร้าง SSL certificate สำหรับ IP นั้น
- ✅ อนุญาต CORS จาก 10.x.x.x ทั้งหมด
- ✅ แสดง API URL ที่ถูกต้อง

### 2. Frontend Access
```bash
# รัน frontend บนเครื่องใดก็ได้
npm run dev
```

Frontend จะ:
- ✅ Detect IP ของ backend อัตโนมัติ
- ✅ เชื่อมต่อ API ได้โดยไม่ต้องแก้ไข config
- ✅ ทำงานได้บน network IP ใดก็ได้

## 🔒 Security Features

### CORS Configuration
```javascript
// อนุญาต 10.x.x.x ทั้งหมด
if (origin.startsWith('http://10.') || origin.startsWith('https://10.')) {
  return callback(null, true);
}
```

### SSL Certificate
- สร้างอัตโนมัติสำหรับ IP ที่ detect ได้
- Self-signed certificate สำหรับ development
- รองรับ HTTPS บน local network

## 📱 Production Deployment

### Netlify
- ✅ รองรับ Netlify deployment
- ✅ CORS อนุญาต Netlify domains
- ✅ Environment variables support

### Environment Variables
```bash
# Backend
VITE_API_URL=https://your-backend-ip:3001/api
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend-ip:3001/api
```

## 🛠️ Troubleshooting

### SSL Certificate Issues
```bash
# ลบ SSL certificate เก่า
rm -rf backend/ssl/

# รันใหม่เพื่อสร้าง certificate ใหม่
npm start
```

### CORS Issues
- ตรวจสอบว่า IP อยู่ใน 10.x.x.x range
- ตรวจสอบ SSL certificate ตรงกับ IP
- ตรวจสอบ firewall settings

### Network Issues
```bash
# ตรวจสอบ IP ที่ detect ได้
ipconfig  # Windows
ifconfig  # Mac/Linux

# ตรวจสอบ port ที่ใช้งาน
netstat -an | grep 3001
```

## 📊 Database Configuration

### Demo Mode
- ระบบจะใช้ sample data ถ้าไม่มี database connection
- ไม่ต้อง setup database สำหรับ testing

### Production Database
```bash
# ตั้งค่าใน .env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

## 🎯 Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd fixit-bright-dash-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Start backend**
   ```bash
   cd backend
   npm start
   ```

4. **Start frontend**
   ```bash
   npm run dev
   ```

5. **Access application**
   - Frontend: `http://localhost:8081`
   - Backend: `https://localhost:3001`

## 🔄 Updates

### Auto-Update Features
- ✅ IP detection อัตโนมัติ
- ✅ SSL certificate generation
- ✅ CORS configuration
- ✅ API URL detection

### Manual Updates
- แก้ไข `backend/server.js` สำหรับ CORS rules
- แก้ไข `src/services/api.ts` สำหรับ API URL logic
- แก้ไข `backend/config-windows.js` สำหรับ configuration

---

## 📞 Support
หากมีปัญหาการ deploy หรือ configuration กรุณาติดต่อทีม IT
