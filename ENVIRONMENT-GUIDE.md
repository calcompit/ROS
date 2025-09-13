# Environment Configuration Guide

## การตั้งค่า Environment Variables

### 1. สำหรับ Development (localhost)

#### Frontend (.env.local):
```bash
# Copy จาก env.example
cp env.example .env.local

# แก้ไข .env.local
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

#### Backend (.env):
```bash
# Copy จาก backend/env.example
cp backend/env.example backend/.env

# แก้ไข backend/.env
JWT_SECRET=your-local-jwt-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 2. สำหรับ Production (Netlify)

#### ตั้งค่าใน Netlify Dashboard:
1. ไปที่ **Site settings** > **Environment variables**
2. ตั้งค่าตัวแปรต่อไปนี้:

```bash
VITE_API_URL = https://your-production-api.com/api
VITE_WS_URL = https://your-production-api.com
VITE_APP_ENV = production
VITE_ENABLE_DEBUG = false
VITE_ENABLE_ANALYTICS = true
```

### 3. การ Debug

#### ใน Development:
- เปิด `VITE_ENABLE_DEBUG=true` ใน `.env.local`
- จะเห็น API logs ใน console
- ใช้ localhost URLs สำหรับ API

#### ใน Production:
- ตั้งค่า `VITE_ENABLE_DEBUG=false` ใน Netlify
- ไม่มี API logs ใน console
- ใช้ production URLs

### 4. การตรวจสอบ

#### ตรวจสอบ Environment Variables:
```javascript
// ใน browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('App Env:', import.meta.env.VITE_APP_ENV);
console.log('Debug Mode:', import.meta.env.VITE_ENABLE_DEBUG);
```

#### ตรวจสอบ Security:
```bash
# รัน security check
npm run security-check

# ตรวจสอบไฟล์ที่ commit
git status
git ls-files | grep -E "\.(env|key|secret)$"
```

### 5. การแก้ไขปัญหา

#### ถ้า API ไม่เชื่อมต่อ:
1. ตรวจสอบ API URL ใน environment variables
2. ตรวจสอบ CORS settings ใน backend
3. ตรวจสอบ Network tab ใน browser

#### ถ้า Environment Variables ไม่ทำงาน:
1. ตรวจสอบชื่อตัวแปร (ต้องขึ้นต้นด้วย VITE_)
2. Restart development server
3. ตรวจสอบไฟล์ .env.local

### 6. Best Practices

#### ✅ ควรทำ:
- ใช้ environment variables สำหรับข้อมูลที่สำคัญ
- ตั้งค่า .env.local สำหรับ development
- ตั้งค่าใน Netlify Dashboard สำหรับ production
- ใช้ localhost URLs สำหรับ debug

#### ❌ อย่าทำ:
- ใส่ API URLs หรือ secrets ในโค้ด
- Commit ไฟล์ .env
- ใช้ production URLs ใน development
- เปิด debug mode ใน production

### 7. ไฟล์ที่สำคัญ

- `env.example` - Template สำหรับ frontend
- `backend/env.example` - Template สำหรับ backend
- `.env.local` - Environment variables สำหรับ development
- `backend/.env` - Environment variables สำหรับ backend
- `netlify.toml` - การตั้งค่า Netlify (ไม่ใส่ secrets)

---

**หมายเหตุ:** 
- สำหรับ localhost development ไม่ต้องซ่อนอะไร
- ข้อมูลที่สำคัญควรตั้งค่าใน Netlify Dashboard
- ใช้ localhost URLs สำหรับ debug และ development
