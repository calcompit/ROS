# การตั้งค่า Environment Variables ที่ถูกต้อง

## สรุปการเปลี่ยนแปลง

### 1. ไฟล์ที่แก้ไขแล้ว

#### ✅ Frontend
- `src/config/environment.ts` - เปลี่ยน IP addresses เป็น placeholder
- `src/services/api.ts` - ปรับปรุงการแสดง debug logs
- `env.example` - สร้าง template สำหรับ environment variables

#### ✅ Backend  
- `backend/config/database.js` - เปลี่ยน database credentials เป็น placeholder
- `backend/routes/database.js` - เปลี่ยน IP addresses เป็น placeholder
- `backend/env.example` - ปรับปรุง template

#### ✅ Netlify
- `netlify.toml` - **ยังคงมี API URLs ที่ถูกต้อง** (ไม่เปลี่ยน)

### 2. การตั้งค่าสำหรับ Development (localhost)

#### สร้างไฟล์ .env.local:
```bash
# Frontend environment variables
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

#### สร้างไฟล์ backend/.env:
```bash
# Backend environment variables
JWT_SECRET=your-local-jwt-secret
DB_SERVER=YOUR_ACTUAL_DATABASE_SERVER
DB_USER=YOUR_ACTUAL_DATABASE_USER
DB_PASSWORD=YOUR_ACTUAL_DATABASE_PASSWORD
DB_NAME=YOUR_ACTUAL_DATABASE_NAME
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 3. การตั้งค่าสำหรับ Production (Netlify)

#### ใน Netlify Dashboard:
1. ไปที่ **Site settings** > **Environment variables**
2. ตั้งค่าตัวแปรต่อไปนี้:

```bash
VITE_API_URL = https://wk-svr01.neofelis-mooneye.ts.net/api
VITE_WS_URL = https://wk-svr01.neofelis-mooneye.ts.net
VITE_APP_ENV = production
VITE_ENABLE_DEBUG = false
```

### 4. การใช้งาน

#### Development:
```bash
# เริ่ม development server
npm run dev

# ตรวจสอบ security
npm run security-check
```

#### Production:
```bash
# Build สำหรับ production
npm run build:netlify

# Deploy ไปยัง Netlify
# (จะใช้ environment variables จาก Netlify Dashboard)
```

### 5. ข้อมูลที่สำคัญ

#### ✅ ยังคงใช้งานได้:
- **netlify.toml** - มี API URLs ที่ถูกต้อง
- **localhost URLs** - สำหรับ development
- **Environment variables** - สำหรับ configuration

#### ✅ ถูกซ่อนแล้ว:
- **IP addresses** - เปลี่ยนเป็น placeholder
- **Database credentials** - เปลี่ยนเป็น placeholder
- **Private domains** - เปลี่ยนเป็น placeholder

### 6. การตรวจสอบ

#### ตรวจสอบ Environment Variables:
```javascript
// ใน browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('App Env:', import.meta.env.VITE_APP_ENV);
```

#### ตรวจสอบ Security:
```bash
npm run security-check
```

### 7. ข้อดีของการเปลี่ยนแปลง

1. **ความปลอดภัย** - ไม่มีข้อมูลสำคัญในโค้ด
2. **ความยืดหยุ่น** - เปลี่ยน environment ได้ง่าย
3. **การ Debug** - localhost ยังคงแสดง logs ได้
4. **การ Deploy** - production ใช้ environment variables

---

**หมายเหตุ:** 
- สำหรับ localhost development ไม่ต้องซ่อนอะไร
- ข้อมูลที่สำคัญควรตั้งค่าใน environment variables
- netlify.toml ยังคงมี API URLs ที่ถูกต้องสำหรับ production
