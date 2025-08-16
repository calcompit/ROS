# Database Connection Management Guide

คู่มือการจัดการการเชื่อมต่อฐานข้อมูลใน FixIt Bright Dashboard

## 🎯 ฟีเจอร์ใหม่

ระบบตอนนี้มี popup dialog สำหรับจัดการการเชื่อมต่อฐานข้อมูลที่ให้คุณ:

1. **ตรวจสอบสถานะการเชื่อมต่อ** - ดูว่าเชื่อมต่อ SQL Server หรือใช้ Demo mode
2. **ทดสอบการเชื่อมต่อ** - ทดสอบการเชื่อมต่อ SQL Server
3. **Reconnect** - ลองเชื่อมต่อใหม่
4. **Switch to Demo** - เปลี่ยนไปใช้ Demo mode

## 🚀 วิธีใช้งาน

### 1. เปิด Database Connection Dialog
- คลิกที่ badge สถานะฐานข้อมูลใน Header (DB, Demo, หรือ DB Error)
- Dialog จะแสดงสถานะปัจจุบันและตัวเลือกต่างๆ

### 2. ตรวจสอบสถานะ
- **SQL Server Connected** (สีเขียว) - เชื่อมต่อ SQL Server ได้
- **Demo Mode** (สีส้ม) - ใช้ SQLite demo database
- **DB Error** (สีแดง) - ไม่สามารถเชื่อมต่อได้

### 3. ทดสอบการเชื่อมต่อ
- คลิกปุ่ม "Test Connection" เพื่อทดสอบการเชื่อมต่อ SQL Server
- ระบบจะแสดงผลการทดสอบ

### 4. Reconnect
- คลิกปุ่ม "Reconnect" เพื่อลองเชื่อมต่อใหม่
- ถ้าเชื่อมต่อไม่ได้ จะเปลี่ยนไปใช้ Demo mode อัตโนมัติ

### 5. Switch to Demo
- คลิกปุ่ม "Switch to Demo" เพื่อเปลี่ยนไปใช้ Demo mode
- ใช้สำหรับการทดสอบเมื่อไม่ต้องการเชื่อมต่อ SQL Server

## 📊 สถานะต่างๆ

### SQL Server Connected
```
✅ Connected to SQL Server
Server: 10.53.64.205 / mes
User: ccet
```

### Demo Mode
```
🧪 Demo Mode
Using local SQLite database with sample data for demonstration purposes.
```

### Connection Failed
```
❌ Database connection failed. Using demo mode.
```

## 🔧 API Endpoints

### GET /api/database/status
ตรวจสอบสถานะการเชื่อมต่อฐานข้อมูล

### POST /api/database/test-connection
ทดสอบการเชื่อมต่อ SQL Server

### POST /api/database/reconnect
ลองเชื่อมต่อใหม่

### POST /api/database/demo-mode
เปลี่ยนไปใช้ Demo mode

## ⚙️ การตั้งค่า

### Environment Variables (backend/.env)
```bash
# SQL Server Configuration
DB_SERVER=10.53.64.205
DB_PORT=1433
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes

# Connection Settings
DB_TYPE=sqlserver
```

## 🔄 การทำงานของระบบ

1. **เริ่มต้น**: ระบบจะลองเชื่อมต่อ SQL Server ก่อน
2. **สำเร็จ**: ใช้ SQL Server database
3. **ล้มเหลว**: เปลี่ยนไปใช้ SQLite demo database อัตโนมัติ
4. **การจัดการ**: ผู้ใช้สามารถจัดการผ่าน dialog ได้

## 🛠️ Troubleshooting

### ไม่สามารถเชื่อมต่อ SQL Server
1. ตรวจสอบการตั้งค่าใน backend/.env
2. ตรวจสอบว่า SQL Server กำลังรันอยู่
3. ตรวจสอบ network connectivity
4. ใช้ "Test Connection" เพื่อดู error message

### Demo Mode ไม่ทำงาน
1. ตรวจสอบว่า SQLite database file สร้างแล้ว
2. ตรวจสอบ file permissions
3. Restart backend server

### Dialog ไม่เปิด
1. ตรวจสอบว่า Backend กำลังรันอยู่ที่ port 3001
2. ตรวจสอบ CORS settings
3. เปิด Developer Tools และดู Console errors

## 📝 หมายเหตุ

- ระบบจะ refresh หน้าเว็บหลังจากเปลี่ยนการเชื่อมต่อ
- Demo mode ใช้ข้อมูลตัวอย่างสำหรับการทดสอบ
- การเชื่อมต่อ SQL Server ต้องมีการตั้งค่าที่ถูกต้อง
- WebSocket ยังคงทำงานได้ทั้งใน SQL Server และ Demo mode
