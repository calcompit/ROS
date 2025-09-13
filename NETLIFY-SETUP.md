# Netlify Setup Guide

## การตั้งค่า Environment Variables ใน Netlify

### 1. เข้าไปที่ Netlify Dashboard
1. ไปที่ [netlify.com](https://netlify.com)
2. เลือก site ของคุณ
3. ไปที่ **Site settings** > **Environment variables**

### 2. ตั้งค่า Environment Variables

#### จำเป็นต้องตั้งค่า:
```bash
VITE_API_URL = https://your-production-api.com/api
VITE_WS_URL = https://your-production-api.com
VITE_APP_ENV = production
```

#### เลือกตั้งค่า (ถ้าต้องการ):
```bash
VITE_ENABLE_DEBUG = false
VITE_ENABLE_ANALYTICS = true
VITE_APP_SECRET_KEY = your-app-secret-key
```

### 3. การตั้งค่าใน Netlify Dashboard

1. **Site settings** → **Environment variables**
2. คลิก **Add variable**
3. ใส่ชื่อและค่าตามที่ต้องการ
4. เลือก **Deploy contexts**:
   - **All deploy contexts** (สำหรับทุก environment)
   - **Production deploys only** (เฉพาะ production)
   - **Branch deploys only** (เฉพาะ branch)

### 4. การตรวจสอบ

#### ตรวจสอบใน Build Logs:
1. ไปที่ **Deploys** tab
2. คลิกที่ build ล่าสุด
3. ดูใน **Build log** ว่า environment variables ถูกโหลดหรือไม่

#### ตรวจสอบใน Browser:
```javascript
// เปิด Developer Tools และรัน:
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_APP_ENV);
```

### 5. การตั้งค่าสำหรับ Development

สำหรับ localhost ไม่ต้องซ่อนอะไร เพราะใช้สำหรับ debug:

```bash
# .env.local (สำหรับ development)
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_APP_ENV=development
VITE_ENABLE_DEBUG=true
```

### 6. การตั้งค่าสำหรับ Production

```bash
# ใน Netlify Environment Variables
VITE_API_URL=https://your-actual-production-api.com/api
VITE_WS_URL=https://your-actual-production-api.com
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### 7. การ Deploy

#### Automatic Deploy:
- Push ไปที่ main branch จะ auto deploy
- Environment variables จะถูกโหลดอัตโนมัติ

#### Manual Deploy:
```bash
# Build locally
npm run build:netlify

# Deploy to Netlify
netlify deploy --prod
```

### 8. การแก้ไขปัญหา

#### ถ้า Environment Variables ไม่ทำงาน:
1. ตรวจสอบชื่อตัวแปร (ต้องขึ้นต้นด้วย VITE_)
2. ตรวจสอบ Deploy context
3. Redeploy site
4. ตรวจสอบ Build logs

#### ถ้า API ไม่เชื่อมต่อ:
1. ตรวจสอบ CORS settings ใน backend
2. ตรวจสอบ API URL ใน environment variables
3. ตรวจสอบ Network tab ใน browser

### 9. Security Best Practices

1. **ไม่ใส่ sensitive data** ใน netlify.toml
2. **ใช้ Environment Variables** สำหรับข้อมูลที่สำคัญ
3. **ตั้งค่า Branch protection** ใน Git
4. **ใช้ HTTPS** เสมอ
5. **หมั่นอัพเดท** dependencies

---

**หมายเหตุ:** 
- สำหรับ localhost development ไม่ต้องซ่อนอะไร
- ข้อมูลที่สำคัญควรตั้งค่าใน Netlify Dashboard เท่านั้น
- อย่าใส่ API URLs หรือ secrets ใน netlify.toml
