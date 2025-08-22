# Environment Setup Guide

## การสลับ Backend Environment

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
# สลับไป Local Development (Backend บน MacBook)
./switch-env.sh localhost 3001

# สลับไป Windows Backend (Backend บน Windows)
./switch-env.sh 10.51.101.49 3001

# สลับไป Production
./switch-env.sh wk-svr01.neofelis-mooneye.ts.net 443
```

### วิธีที่ 2: แก้ไขไฟล์ .env.local เอง

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลัก:

```env
# Local Development (Backend บน MacBook)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_ENV=development

# Windows Backend (Backend บน Windows)
# VITE_API_URL=http://100.73.2.100:3001/api
# VITE_WS_URL=http://100.73.2.100:3001
# VITE_APP_ENV=development

# Production
# VITE_API_URL=https://wk-svr01.neofelis-mooneye.ts.net/api
# VITE_WS_URL=https://wk-svr01.neofelis-mooneye.ts.net
# VITE_APP_ENV=production
```

## Workflow ที่แนะนำ

### เมื่อเขียนโค้ดบน MacBook:
1. `./switch-env.sh localhost 3001`
2. รัน backend: `cd backend && npm start`
3. รัน frontend: `npm run dev`

### เมื่อย้ายไป Windows:
1. Push โค้ดไป Git
2. บน Windows: Pull โค้ด
3. รัน backend บน Windows: `start-windows.bat` หรือ `node server-http.js`
4. บน MacBook: `./switch-env.sh 10.51.101.49 3001`
5. รัน frontend: `npm run dev`

## Windows Setup

### วิธีที่ 1: ใช้ Batch File (แนะนำ)
```cmd
# ในโฟลเดอร์ backend บน Windows
start-windows.bat
```

### วิธีที่ 2: รันด้วย Node.js
```cmd
# ในโฟลเดอร์ backend บน Windows
npm install
node server-http.js
```

### Windows Backend จะรันที่:
- **Local**: http://localhost:3001
- **Network**: http://10.51.101.49:3001
- **Health Check**: http://localhost:3001/health

## การแสดง Environment Status

ใน UI จะแสดง badge ว่า backend กำลังรันที่ไหน:
- 🖥️ Local Development
- 🪟 Windows Backend  
- 🌐 Production

## CORS Configuration

Backend รองรับ CORS สำหรับ:
- `localhost:*`
- `127.0.0.1:*`
- `10.x.x.x:*` (ทุก IP ที่ขึ้นต้นด้วย 10)
- `100.x.x.x:*` (ทุก IP ที่ขึ้นต้นด้วย 100)
- `*.netlify.app`

## Troubleshooting

### ถ้า API ไม่ทำงาน:
1. ตรวจสอบว่า backend รันอยู่
2. ตรวจสอบ URL ใน .env.local
3. Restart frontend: `npm run dev`

### ถ้าไม่สามารถเชื่อม Windows:
1. ตรวจสอบ IP address ของ Windows (อาจเป็น 100.73.2.100)
2. ตรวจสอบ firewall settings
3. ตรวจสอบ network connectivity
4. ใช้ `ipconfig` บน Windows เพื่อดู IP ที่ถูกต้อง

### ถ้า CORS Error:
1. ตรวจสอบว่า IP ของ frontend อยู่ใน allowedOrigins
2. ตรวจสอบ port ที่ใช้
3. Restart backend หลังจากแก้ไข CORS
