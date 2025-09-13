# Security Setup Guide

## การตั้งค่าความปลอดภัยสำหรับ Repair Order System

### 1. Environment Variables

#### Frontend (.env.local)
```bash
# Copy env.example to .env.local
cp env.example .env.local

# Edit .env.local with your actual values
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
VITE_WINDOWS_API_URL=http://YOUR_ACTUAL_WINDOWS_IP:3001/api
VITE_PRODUCTION_API_URL=https://your-actual-production-domain.com/api
VITE_APP_ENV=development
```

#### Backend (.env)
```bash
# Copy backend/env.example to backend/.env
cp backend/env.example backend/.env

# Edit backend/.env with your actual values
JWT_SECRET=your-actual-jwt-secret-here
SESSION_SECRET=your-actual-session-secret-here
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### 2. ข้อมูลที่ต้องซ่อน

#### ❌ อย่าใส่ในโค้ด:
- IP addresses ที่เป็นส่วนตัว
- Domain names ที่เป็นส่วนตัว
- JWT secrets
- Database credentials
- API keys
- SSL certificates

#### ✅ ใช้ environment variables แทน:
- `process.env.JWT_SECRET`
- `import.meta.env.VITE_API_URL`
- `process.env.CORS_ORIGIN`

### 3. การตั้งค่าสำหรับ Production

#### Frontend (Netlify/Vercel)
```bash
# ตั้งค่าใน deployment platform
VITE_API_URL=https://your-production-api.com/api
VITE_WS_URL=https://your-production-api.com
VITE_APP_ENV=production
VITE_ENABLE_DEBUG=false
```

#### Backend (Server)
```bash
# ตั้งค่าใน server environment
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
PRODUCTION_DOMAIN=your-production-domain.com
```

### 4. การตรวจสอบความปลอดภัย

#### ตรวจสอบไฟล์ที่ commit:
```bash
# ตรวจสอบว่าไม่มีไฟล์สำคัญถูก commit
git status
git ls-files | grep -E "\.(env|key|pem|secret)$"

# ตรวจสอบ history
git log --oneline --grep="secret\|key\|password"
```

#### ตรวจสอบ environment variables:
```bash
# Frontend
npm run build
# ตรวจสอบว่าไม่มีข้อมูลสำคัญใน build output

# Backend
node -e "console.log(process.env.JWT_SECRET)"
# ตรวจสอบว่าได้ค่าที่ถูกต้อง
```

### 5. Best Practices

1. **ใช้ .env files** สำหรับข้อมูลที่สำคัญ
2. **ไม่ commit** ไฟล์ .env
3. **ใช้ strong secrets** สำหรับ JWT และ session
4. **จำกัด CORS origins** ให้เฉพาะ domain ที่จำเป็น
5. **ใช้ HTTPS** ใน production
6. **หมั่นอัพเดท** dependencies และ security patches

### 6. การแก้ไขปัญหา

#### หากข้อมูลสำคัญถูก commit แล้ว:
```bash
# ลบไฟล์จาก git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (ระวัง!)
git push origin --force --all
```

#### หากต้องการเปลี่ยน secrets:
1. เปลี่ยนค่าใน .env files
2. Restart applications
3. Invalidate old tokens (ถ้าจำเป็น)

### 7. การตรวจสอบความปลอดภัย

```bash
# ตรวจสอบ dependencies ที่มีช่องโหว่
npm audit
npm audit fix

# ตรวจสอบไฟล์ที่ sensitive
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules
grep -r "10\." src/ --exclude-dir=node_modules
grep -r "localhost" src/ --exclude-dir=node_modules
```

---

**หมายเหตุ:** ไฟล์นี้ควรจะถูกอ่านและทำตามอย่างเคร่งครัดเพื่อความปลอดภัยของระบบ
