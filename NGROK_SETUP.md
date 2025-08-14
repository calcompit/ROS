# 🌐 คู่มือการ Setup ngrok TCP Tunnel

## 📋 **ngrok คืออะไร?**

ngrok เป็นเครื่องมือที่สร้าง secure tunnel จาก local server ไปยัง internet:
- ✅ **TCP Tunnel** - สำหรับ database connection
- ✅ **HTTP Tunnel** - สำหรับ web server
- ✅ **ฟรี tier** - ใช้งานได้เลย
- ✅ **ปลอดภัย** - มี authentication

## 🎯 **ข้อดีของการใช้ ngrok:**

1. **ไม่ต้องเปลี่ยน database** 🗄️
2. **ง่ายมาก** - แค่รันคำสั่งเดียว
3. **ฟรี** - ไม่มีค่าใช้จ่าย
4. **ปลอดภัย** - มี authentication
5. **เข้าถึงได้จากที่ไหนก็ได้** 🌍

## 📁 **ขั้นตอนการ Setup:**

### **ขั้นตอนที่ 1: ติดตั้ง ngrok**

#### **Windows:**
```bash
# ดาวน์โหลดจาก https://ngrok.com/download
# หรือใช้ Chocolatey
choco install ngrok

# หรือใช้ Scoop
scoop install ngrok
```

#### **macOS:**
```bash
# ใช้ Homebrew
brew install ngrok

# หรือดาวน์โหลดจาก https://ngrok.com/download
```

#### **Linux:**
```bash
# ใช้ snap
sudo snap install ngrok

# หรือดาวน์โหลดจาก https://ngrok.com/download
```

### **ขั้นตอนที่ 2: สมัคร ngrok Account**

1. ไปที่ https://ngrok.com/
2. **Sign up** ฟรี
3. **Verify email**
4. **Get your authtoken**

### **ขั้นตอนที่ 3: ตั้งค่า ngrok**

```bash
# ใส่ authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN

# ตรวจสอบการตั้งค่า
ngrok config check
```

### **ขั้นตอนที่ 4: รัน Backend ที่บ้าน**

```bash
# ไปที่โฟลเดอร์ backend
cd backend

# รัน backend
npm run start:local
```

**ถ้าสำเร็จจะเห็น:**
```
🚀 HTTPS Server running on port 3001
📍 Health check: https://localhost:3001/health
🌐 API base URL: https://[YOUR_IP]:3001/api
```

### **ขั้นตอนที่ 5: สร้าง TCP Tunnel สำหรับ Database**

```bash
# สร้าง tunnel สำหรับ SQL Server (port 1433)
ngrok tcp 1433
```

**จะได้ URL แบบนี้:**
```
Forwarding    tcp://0.tcp.ngrok.io:12345 -> localhost:1433
```

### **ขั้นตอนที่ 6: อัพเดท Environment Variables**

#### **ใน Railway หรือ Cloud Platform:**
```env
# Database Configuration (ใช้ ngrok URL)
DB_SERVER=0.tcp.ngrok.io
DB_PORT=12345
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes

# JWT Secret
JWT_SECRET=f8669d0c76f73e98556cbea6ea820bafb696891c55fb7c5b2416d0ea31b998dc392adb5cbb69d3372e35ac4deb48ad8cd7d6a8ba5dd18fb8994d58b079c8fafe

# Environment
NODE_ENV=production
```

### **ขั้นตอนที่ 7: อัพเดท Frontend**

#### **ใน Netlify Environment Variables:**
```env
VITE_API_URL=https://your-railway-app.railway.app/api
```

## 🔧 **การตั้งค่าแบบ Advanced:**

### **1. ใช้ ngrok config file:**
```yaml
# ~/.ngrok2/ngrok.yml
version: "2"
authtoken: YOUR_AUTHTOKEN
tunnels:
  database:
    proto: tcp
    addr: 1433
  api:
    proto: http
    addr: 3001
```

### **2. รันหลาย tunnel พร้อมกัน:**
```bash
# รัน database tunnel
ngrok tcp 1433 &

# รัน API tunnel
ngrok http 3001 &
```

### **3. ใช้ custom domain (ถ้ามี):**
```bash
ngrok http 3001 --hostname=your-domain.com
```

## 🧪 **การทดสอบ:**

### **ทดสอบ Database Connection:**
```bash
# ทดสอบเชื่อมต่อ database ผ่าน ngrok
sqlcmd -S 0.tcp.ngrok.io,12345 -U ccet -P !qaz7410 -d mes -Q "SELECT TOP 1 * FROM TBL_IT_PCMAINTENANCE"
```

### **ทดสอบ API:**
```bash
# ทดสอบ API ผ่าน ngrok
curl https://your-ngrok-url.ngrok.io/health
```

## ⚠️ **ข้อจำกัดของ Free Tier:**

### **ngrok Free:**
- ✅ **1 TCP tunnel** ต่อครั้ง
- ✅ **1 HTTP tunnel** ต่อครั้ง
- ✅ **Random URLs** (เปลี่ยนทุกครั้งที่ restart)
- ❌ **Custom domains** ไม่ได้
- ❌ **Multiple tunnels** ไม่ได้

### **ngrok Paid:**
- 💰 **$8/เดือน**
- ✅ **Fixed URLs**
- ✅ **Custom domains**
- ✅ **Multiple tunnels**
- ✅ **Reserved domains**

## 🔧 **การแก้ไขปัญหา:**

### **ปัญหา: ngrok tunnel ไม่ทำงาน**
```bash
# ตรวจสอบ authtoken
ngrok config check

# ตรวจสอบ port
netstat -an | findstr :1433
```

### **ปัญหา: Database connection failed**
```bash
# ตรวจสอบ ngrok tunnel
ngrok api tunnels list

# ตรวจสอบ firewall
netsh advfirewall firewall show rule name="SQL Server"
```

### **ปัญหา: URL เปลี่ยนทุกครั้ง**
```bash
# ใช้ ngrok config file
# หรือ upgrade เป็น paid plan
```

## 📝 **สรุปขั้นตอน:**

1. ✅ **ติดตั้ง ngrok**
2. ✅ **สมัคร account และใส่ authtoken**
3. ✅ **รัน backend ที่บ้าน**
4. ✅ **สร้าง TCP tunnel สำหรับ database**
5. ✅ **อัพเดท environment variables**
6. ✅ **อัพเดท frontend URL**
7. ✅ **ทดสอบระบบ**

## 🎯 **ข้อแนะนำ:**

### **สำหรับ Production:**
- **ใช้ ngrok paid plan** - เพื่อได้ fixed URL
- **ใช้ custom domain** - เพื่อความเสถียร
- **ตั้งค่า monitoring** - เพื่อตรวจสอบ tunnel

### **สำหรับ Development:**
- **ใช้ free tier** - เพียงพอสำหรับทดสอบ
- **บันทึก URL** - ไว้ใช้ใน environment variables
- **restart tunnel** - เมื่อ URL เปลี่ยน

## 🆘 **Support:**

- **ngrok Docs:** https://ngrok.com/docs
- **ngrok Community:** https://community.ngrok.com/
- **GitHub Issues:** สร้าง issue ใน repository

---

**🎉 เสร็จแล้ว! ตอนนี้ database ของคุณจะเข้าถึงได้จาก cloud ผ่าน ngrok tunnel!**
