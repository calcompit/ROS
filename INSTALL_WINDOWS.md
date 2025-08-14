# 🚀 คู่มือการติดตั้ง Backend บน Windows (แบบ Copy)

## 📋 **สิ่งที่ต้องเตรียม**

### **Software ที่ต้องติดตั้ง:**
1. **Node.js** - ดาวน์โหลดจาก https://nodejs.org/ (เลือก LTS version)
2. **Git** - ดาวน์โหลดจาก https://git-scm.com/ (เพื่อใช้ Git Bash)

### **ตรวจสอบการติดตั้ง:**
```cmd
node --version
npm --version
git --version
```

## 📁 **ขั้นตอนการ Copy และ Setup**

### **ขั้นตอนที่ 1: Copy โฟลเดอร์**
```bash
# Copy โฟลเดอร์ backend ไปยังเครื่อง Windows
# ใช้ USB, Network Share, หรือ Cloud Storage
```

### **ขั้นตอนที่ 2: เปิด Git Bash**
```bash
# เปิด Git Bash ในโฟลเดอร์ backend ที่ copy มา
# หรือเปิด Git Bash แล้ว cd ไปยังโฟลเดอร์ backend
```

### **ขั้นตอนที่ 3: ติดตั้ง Dependencies**
```bash
# ติดตั้ง Node.js packages
npm install
```

### **ขั้นตอนที่ 4: สร้าง SSL Certificate**
```bash
# สร้างโฟลเดอร์ SSL
mkdir ssl
cd ssl

# สร้าง self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost"

# กลับไปโฟลเดอร์ backend
cd ..
```

### **ขั้นตอนที่ 5: ตั้งค่า Environment Variables**
```bash
# สร้างไฟล์ .env
copy .env.example .env

# แก้ไขไฟล์ .env
notepad .env
```

**ใส่ข้อมูลในไฟล์ .env:**
```env
# Database Configuration
DB_SERVER=10.53.64.205
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes
DB_PORT=1433

# JWT Secret (ใช้ค่านี้)
JWT_SECRET=f8669d0c76f73e98556cbea6ea820bafb696891c55fb7c5b2416d0ea31b998dc392adb5cbb69d3372e35ac4deb48ad8cd7d6a8ba5dd18fb8994d58b079c8fafe

# Port
PORT=3001

# Environment
NODE_ENV=production
```

### **ขั้นตอนที่ 6: เปิด Firewall**
```cmd
# เปิด Command Prompt เป็น Administrator
# กด Win + R แล้วพิมพ์ cmd แล้วกด Ctrl + Shift + Enter

# เพิ่ม Firewall rule
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3001
```

### **ขั้นตอนที่ 7: รัน Backend**
```bash
# กลับไป Git Bash
npm start
```

**ถ้าสำเร็จจะเห็น:**
```
🚀 HTTPS Server running on port 3001
📍 Health check: https://localhost:3001/health
🌐 API base URL: https://[YOUR_IP]:3001/api
```

## 🌐 **การตั้งค่า Frontend**

### **ขั้นตอนที่ 1: หา IP Address**
```cmd
# เปิด Command Prompt
ipconfig
```

**หา IP Address ที่ไม่ใช่ 127.0.0.1 (เช่น 192.168.1.100)**

### **ขั้นตอนที่ 2: อัพเดท Netlify**
1. เปิด https://app.netlify.com
2. เลือก site ของคุณ
3. ไปที่ **Site settings** > **Environment variables**
4. แก้ไข `VITE_API_URL` เป็น: `https://[YOUR_IP]:3001/api`
5. **Save** และ **Redeploy**

## 🧪 **การทดสอบ**

### **ทดสอบ Health Check:**
```bash
# ใน Git Bash
curl -k https://localhost:3001/health
```

### **ทดสอบจาก Network:**
```bash
# แทน [YOUR_IP] ด้วย IP จริง
curl -k https://[YOUR_IP]:3001/health
```

### **ทดสอบ CORS:**
```bash
curl -k -H "Origin: https://calcompit-ros.netlify.app" -X OPTIONS https://[YOUR_IP]:3001/api/repair-orders -v
```

### **ทดสอบ API:**
```bash
# ทดสอบดึงข้อมูล repair orders
curl -k https://[YOUR_IP]:3001/api/repair-orders

# ทดสอบดึงข้อมูล subjects
curl -k https://[YOUR_IP]:3001/api/subjects

# ทดสอบดึงข้อมูล departments
curl -k https://[YOUR_IP]:3001/api/departments
```

## 🔧 **การแก้ไขปัญหา**

### **ปัญหา: Port 3001 ถูกใช้งาน**
```bash
# หยุด process ที่ใช้ port 3001
netstat -ano | findstr :3001
taskkill /PID [PID] /F
```

### **ปัญหา: SSL Certificate ไม่พบ**
```bash
# ตรวจสอบว่าไฟล์มีอยู่
ls -la ssl/
# ควรเห็น key.pem และ cert.pem
```

### **ปัญหา: Database Connection Failed**
```bash
# ตรวจสอบการเชื่อมต่อ database
node -e "import('./config/database.js').then(db => db.testConnection()).then(console.log)"
```

### **ปัญหา: Firewall Block**
```cmd
# ตรวจสอบ Firewall rule
netsh advfirewall firewall show rule name="Node.js Backend"
```

## 📝 **สรุปขั้นตอน**

1. ✅ **Copy โฟลเดอร์ backend** ไป Windows
2. ✅ **ติดตั้ง Node.js และ Git**
3. ✅ **รัน `npm install`**
4. ✅ **สร้าง SSL certificate**
5. ✅ **ตั้งค่า .env**
6. ✅ **เปิด Firewall**
7. ✅ **รัน `npm start`**
8. ✅ **หา IP address**
9. ✅ **อัพเดท Netlify Environment Variable**
10. ✅ **ทดสอบระบบ**

## ⚠️ **หมายเหตุสำคัญ**

- **Database:** ต้องสามารถเข้าถึง `10.53.64.205` ได้
- **IP Address:** ต้องเป็น IP ที่เข้าถึงได้จาก internet
- **Firewall:** ต้องเปิด port 3001
- **SSL Certificate:** Self-signed จะมี warning แต่ใช้งานได้

## 🆘 **ติดต่อ Support**

หากมีปัญหาในการติดตั้ง กรุณาติดต่อทีมพัฒนา
