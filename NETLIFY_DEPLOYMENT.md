# Netlify Deployment Guide

## 🚀 การ Deploy บน Netlify

### 1. การเชื่อมต่อกับ GitHub

1. ไปที่ [Netlify Dashboard](https://app.netlify.com/)
2. คลิก "New site from Git"
3. เลือก GitHub และเลือก repository `calcompit/ROS`
4. ตั้งค่าการ build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 2. การตั้งค่า Environment Variables

ไปที่ **Site Settings** > **Environment Variables** และเพิ่ม:

| Variable Name | Value |
|---------------|-------|
| `VITE_API_URL` | `https://wk-svr01.neofelis-mooneye.ts.net/api` |
| `NODE_ENV` | `production` |

### 3. การตั้งค่า Domain (ถ้าต้องการ)

1. ไปที่ **Domain management**
2. คลิก "Add custom domain"
3. ใส่ domain ที่ต้องการ

### 4. การตั้งค่า Build Hooks (ถ้าต้องการ)

1. ไปที่ **Site Settings** > **Build & deploy** > **Build hooks**
2. คลิก "Add build hook"
3. ตั้งชื่อและสร้าง hook URL

### 5. การตรวจสอบ Deployment

หลังจาก deploy สำเร็จ:

1. เปิด Developer Tools (F12)
2. ดู Console จะแสดง:
   ```
   API URL: https://wk-svr01.neofelis-mooneye.ts.net/api
   ```

### 6. การแก้ไขปัญหา

#### ปัญหาที่พบบ่อย:

1. **Build fails:**
   - ตรวจสอบ Node.js version (ต้องเป็น 18+)
   - ตรวจสอบ dependencies ใน package.json

2. **404 errors:**
   - ตรวจสอบไฟล์ `_redirects` และ `netlify.toml`
   - ตรวจสอบ client-side routing

3. **API errors:**
   - ตรวจสอบ Environment Variables
   - ตรวจสอบ CORS settings บน backend

### 7. การอัปเดตเว็บไซต์

ทุกครั้งที่ push code ไป GitHub:
1. Netlify จะ auto-deploy ใหม่
2. ตรวจสอบ deployment logs ใน Netlify Dashboard
3. ทดสอบเว็บไซต์หลัง deploy

## 📁 ไฟล์ที่สำคัญ

- `netlify.toml` - การตั้งค่า Netlify
- `public/_redirects` - URL redirects
- `public/_headers` - Security headers
- `.env` - Environment variables (local)
- `ENVIRONMENT_SETUP.md` - คู่มือการตั้งค่า

## 🔗 ลิงก์ที่มีประโยชน์

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with Netlify](https://reactrouter.com/en/main/start/overview#deployment)
