# 🌐 คู่มือการ Setup Cloudflare Tunnel (ฟรี 100%)

## 📋 **Cloudflare Tunnel คืออะไร?**

Cloudflare Tunnel เป็นเครื่องมือฟรีที่สร้าง secure tunnel:
- ✅ **ฟรี 100%** - ไม่มีข้อจำกัด
- ✅ **TCP Tunnel** - สำหรับ database
- ✅ **HTTP Tunnel** - สำหรับ web server
- ✅ **Fixed URLs** - ไม่เปลี่ยน
- ✅ **Custom domains** - ได้
- ✅ **Unlimited tunnels** - ไม่จำกัด

## 🎯 **ข้อดีของ Cloudflare Tunnel:**

1. **ฟรี 100%** - ไม่มีค่าใช้จ่าย
2. **ไม่จำกัด** - ใช้ได้ไม่จำกัด
3. **Fixed URLs** - ไม่เปลี่ยนทุกครั้ง
4. **Custom domains** - ใช้ domain ของตัวเองได้
5. **ปลอดภัย** - ใช้ Cloudflare security
6. **เสถียร** - ใช้ infrastructure ของ Cloudflare

## 📁 **ขั้นตอนการ Setup:**

### **ขั้นตอนที่ 1: สมัคร Cloudflare Account**

1. ไปที่ https://dash.cloudflare.com/
2. **Sign up** ฟรี
3. **Verify email**
4. **Add your domain** (ถ้ามี) หรือใช้ subdomain ของ Cloudflare

### **ขั้นตอนที่ 2: ติดตั้ง cloudflared**

#### **Windows:**
```bash
# ดาวน์โหลดจาก https://github.com/cloudflare/cloudflared/releases
# หรือใช้ Chocolatey
choco install cloudflared

# หรือใช้ Scoop
scoop install cloudflared
```

#### **macOS:**
```bash
# ใช้ Homebrew
brew install cloudflare/cloudflare/cloudflared

# หรือดาวน์โหลดจาก GitHub
```

#### **Linux:**
```bash
# ใช้ package manager
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### **ขั้นตอนที่ 3: Login Cloudflare**

```bash
# Login กับ Cloudflare
cloudflared tunnel login
```

### **ขั้นตอนที่ 4: สร้าง Tunnel**

```bash
# สร้าง tunnel
cloudflared tunnel create my-tunnel

# ดู tunnel ID
cloudflared tunnel list
```

### **ขั้นตอนที่ 5: ตั้งค่า Tunnel**

#### **สร้างไฟล์ config:**
```yaml
# ~/.cloudflared/config.yml
tunnel: YOUR_TUNNEL_ID
credentials-file: ~/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Database tunnel
  - hostname: db.yourdomain.com
    service: tcp://localhost:1433
  # API tunnel  
  - hostname: api.yourdomain.com
    service: http://localhost:3001
  # Catch-all rule
  - service: http_status:404
```

### **ขั้นตอนที่ 6: รัน Tunnel**

```bash
# รัน tunnel
cloudflared tunnel run my-tunnel
```

### **ขั้นตอนที่ 7: อัพเดท DNS**

```bash
# อัพเดท DNS records
cloudflared tunnel route dns my-tunnel db.yourdomain.com
cloudflared tunnel route dns my-tunnel api.yourdomain.com
```

### **ขั้นตอนที่ 8: อัพเดท Environment Variables**

#### **ใน Railway หรือ Cloud Platform:**
```env
# Database Configuration (ใช้ Cloudflare tunnel)
DB_SERVER=db.yourdomain.com
DB_PORT=1433
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes

# JWT Secret
JWT_SECRET=f8669d0c76f73e98556cbea6ea820bafb696891c55fb7c5b2416d0ea31b998dc392adb5cbb69d3372e35ac4deb48ad8cd7d6a8ba5dd18fb8994d58b079c8fafe

# Environment
NODE_ENV=production
```

### **ขั้นตอนที่ 9: อัพเดท Frontend**

#### **ใน Netlify Environment Variables:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 🔧 **การตั้งค่าแบบ Advanced:**

### **1. ใช้ Public Hostname (ง่ายที่สุด):**
```bash
# สร้าง tunnel ด้วย public hostname
cloudflared tunnel --url tcp://localhost:1433 --hostname db-random-name.trycloudflare.com
cloudflared tunnel --url http://localhost:3001 --hostname api-random-name.trycloudflare.com
```

### **2. ใช้ Custom Domain:**
```bash
# ต้องมี domain ที่ชี้ไป Cloudflare
cloudflared tunnel --url tcp://localhost:1433 --hostname db.yourdomain.com
cloudflared tunnel --url http://localhost:3001 --hostname api.yourdomain.com
```

### **3. รันเป็น Service:**
```bash
# Install service
cloudflared service install

# Start service
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## 🧪 **การทดสอบ:**

### **ทดสอบ Database Connection:**
```bash
# ทดสอบเชื่อมต่อ database ผ่าน Cloudflare tunnel
sqlcmd -S db.yourdomain.com,1433 -U ccet -P !qaz7410 -d mes -Q "SELECT TOP 1 * FROM TBL_IT_PCMAINTENANCE"
```

### **ทดสอบ API:**
```bash
# ทดสอบ API ผ่าน Cloudflare tunnel
curl https://api.yourdomain.com/health
```

## 💰 **Pricing:**

### **Cloudflare Tunnel:**
- ✅ **ฟรี 100%** - ไม่มีค่าใช้จ่าย
- ✅ **ไม่จำกัด tunnels**
- ✅ **ไม่จำกัด bandwidth**
- ✅ **Custom domains**
- ✅ **Fixed URLs**

### **Cloudflare Pro ($20/เดือน):**
- 💰 **เพิ่ม features** เช่น Load Balancing, Rate Limiting
- ✅ **Priority support**
- ✅ **Advanced analytics**

## 🔧 **การแก้ไขปัญหา:**

### **ปัญหา: Tunnel ไม่ทำงาน**
```bash
# ตรวจสอบ tunnel status
cloudflared tunnel info my-tunnel

# ตรวจสอบ logs
cloudflared tunnel logs my-tunnel
```

### **ปัญหา: DNS ไม่ resolve**
```bash
# ตรวจสอบ DNS records
nslookup db.yourdomain.com

# อัพเดท DNS
cloudflared tunnel route dns my-tunnel db.yourdomain.com
```

### **ปัญหา: Connection refused**
```bash
# ตรวจสอบ local service
netstat -an | findstr :1433
netstat -an | findstr :3001
```

## 📝 **สรุปขั้นตอน:**

1. ✅ **สมัคร Cloudflare account**
2. ✅ **ติดตั้ง cloudflared**
3. ✅ **Login และสร้าง tunnel**
4. ✅ **ตั้งค่า config**
5. ✅ **รัน tunnel**
6. ✅ **อัพเดท DNS**
7. ✅ **อัพเดท environment variables**
8. ✅ **ทดสอบระบบ**

## 🎯 **ข้อแนะนำ:**

### **สำหรับ Production:**
- **ใช้ custom domain** - เพื่อความเสถียร
- **รันเป็น service** - เพื่อ auto-start
- **ตั้งค่า monitoring** - เพื่อตรวจสอบ tunnel

### **สำหรับ Development:**
- **ใช้ public hostname** - ง่ายและเร็ว
- **บันทึก hostname** - ไว้ใช้ใน environment variables
- **restart tunnel** - เมื่อต้องการ

## 🆘 **Support:**

- **Cloudflare Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Cloudflare Community:** https://community.cloudflare.com/
- **GitHub Issues:** สร้าง issue ใน repository

---

**🎉 เสร็จแล้ว! ตอนนี้คุณมี tunnel ฟรี 100% ที่ไม่จำกัดแล้ว!**
