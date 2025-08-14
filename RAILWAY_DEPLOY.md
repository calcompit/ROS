# 🚀 คู่มือการ Deploy Backend บน Railway

## 📋 **Railway คืออะไร?**

Railway เป็น platform สำหรับ deploy application ที่ง่ายและรวดเร็ว:
- ✅ **ฟรี tier** เริ่มต้น
- ✅ **Auto-deploy** จาก GitHub
- ✅ **SSL** อัตโนมัติ
- ✅ **Custom domains** ได้
- ✅ **Environment variables** ง่าย

## 🎯 **ข้อดีของการใช้ Railway:**

1. **เข้าถึงได้จากที่ไหนก็ได้** 🌍
2. **ไม่ต้องกังวลเรื่อง server management** 🔧
3. **Auto-scaling** 📈
4. **Monitoring และ Logs** 📊
5. **Database ในตัว** (ถ้าต้องการ) 🗄️

## 📁 **ขั้นตอนการ Deploy:**

### **ขั้นตอนที่ 1: เตรียม Repository**

1. **Push code ไป GitHub:**
```bash
git add .
git commit -m "Add Railway deployment support"
git push origin main
```

2. **ตรวจสอบไฟล์ที่ต้องมี:**
   - ✅ `railway.json`
   - ✅ `backend/server-railway.js`
   - ✅ `backend/package.json` (อัพเดทแล้ว)

### **ขั้นตอนที่ 2: สมัคร Railway**

1. ไปที่ https://railway.app/
2. **Sign up** ด้วย GitHub account
3. **Verify email**

### **ขั้นตอนที่ 3: Deploy Project**

1. **คลิก "New Project"**
2. **เลือก "Deploy from GitHub repo"**
3. **เลือก repository** ของคุณ
4. **เลือก "backend" folder** (ถ้ามี)
5. **คลิก "Deploy"**

### **ขั้นตอนที่ 4: ตั้งค่า Environment Variables**

1. **ไปที่ "Variables" tab**
2. **เพิ่ม variables ต่อไปนี้:**

```env
# Database Configuration
DB_SERVER=10.53.64.205
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes
DB_PORT=1433

# JWT Secret
JWT_SECRET=f8669d0c76f73e98556cbea6ea820bafb696891c55fb7c5b2416d0ea31b998dc392adb5cbb69d3372e35ac4deb48ad8cd7d6a8ba5dd18fb8994d58b079c8fafe

# Environment
NODE_ENV=production
```

### **ขั้นตอนที่ 5: ตั้งค่า Custom Domain (ถ้าต้องการ)**

1. **ไปที่ "Settings" tab**
2. **คลิก "Custom Domains"**
3. **เพิ่ม domain** เช่น `api.yourdomain.com`
4. **ตั้งค่า DNS** ตามที่ Railway บอก

### **ขั้นตอนที่ 6: อัพเดท Frontend**

1. **หา Railway URL:**
   - ไปที่ "Deployments" tab
   - คัดลอก URL (เช่น `https://your-app.railway.app`)

2. **อัพเดท Netlify:**
   - เปิด https://app.netlify.com
   - เลือก site ของคุณ
   - ไปที่ **Site settings** > **Environment variables**
   - แก้ไข `VITE_API_URL` เป็น: `https://your-app.railway.app/api`
   - **Save** และ **Redeploy**

## 🧪 **การทดสอบ:**

### **ทดสอบ Health Check:**
```bash
curl https://your-app.railway.app/health
```

### **ทดสอบ API:**
```bash
# ทดสอบดึงข้อมูล repair orders
curl https://your-app.railway.app/api/repair-orders

# ทดสอบดึงข้อมูล subjects
curl https://your-app.railway.app/api/subjects

# ทดสอบดึงข้อมูล departments
curl https://your-app.railway.app/api/departments
```

## 📊 **Monitoring:**

### **ดู Logs:**
1. ไปที่ Railway Dashboard
2. เลือก project ของคุณ
3. ไปที่ "Deployments" tab
4. คลิก deployment ล่าสุด
5. ดู "Logs"

### **ดู Metrics:**
1. ไปที่ "Metrics" tab
2. ดู CPU, Memory, Network usage

## 🔧 **การแก้ไขปัญหา:**

### **ปัญหา: Deploy Failed**
```bash
# ตรวจสอบ logs ใน Railway Dashboard
# ตรวจสอบ environment variables
# ตรวจสอบ database connection
```

### **ปัญหา: Database Connection Failed**
```bash
# ตรวจสอบ DB_SERVER, DB_USER, DB_PASSWORD
# ตรวจสอบว่า database server อนุญาต connection จาก Railway IP
```

### **ปัญหา: CORS Error**
```bash
# ตรวจสอบ CORS configuration ใน server-railway.js
# ตรวจสอบ VITE_API_URL ใน Netlify
```

## 💰 **Pricing:**

### **Free Tier:**
- ✅ **$5 credit** ต่อเดือน
- ✅ **512MB RAM**
- ✅ **1GB storage**
- ✅ **Unlimited deployments**

### **Pro Plan:**
- 💰 **$20/เดือน**
- ✅ **2GB RAM**
- ✅ **10GB storage**
- ✅ **Custom domains**
- ✅ **Priority support**

## 🎯 **สรุปขั้นตอน:**

1. ✅ **Push code ไป GitHub**
2. ✅ **สมัคร Railway**
3. ✅ **Deploy จาก GitHub**
4. ✅ **ตั้งค่า Environment Variables**
5. ✅ **อัพเดท Frontend URL**
6. ✅ **ทดสอบระบบ**

## ⚠️ **หมายเหตุสำคัญ:**

- **Database:** ต้องสามารถเข้าถึงได้จาก Railway IP
- **Environment Variables:** ต้องตั้งค่าถูกต้อง
- **CORS:** ต้องอนุญาต Netlify domain
- **SSL:** Railway จัดการให้อัตโนมัติ

## 🆘 **Support:**

- **Railway Docs:** https://docs.railway.app/
- **Railway Discord:** https://discord.gg/railway
- **GitHub Issues:** สร้าง issue ใน repository

---

**🎉 เสร็จแล้ว! ตอนนี้ backend ของคุณจะรันบน cloud และเข้าถึงได้จากที่ไหนก็ได้!**
