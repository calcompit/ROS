# Environment Variables Setup

## การตั้งค่า API URL

### 1. สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจค

```bash
VITE_API_URL=https://wk-svr01.neofelis-mooneye.ts.net/api
```

### 2. สำหรับ Netlify Deployment

ไปที่ Netlify Dashboard > Site Settings > Environment Variables และเพิ่ม:

| Variable Name | Value |
|---------------|-------|
| `VITE_API_URL` | `https://wk-svr01.neofelis-mooneye.ts.net/api` |

### 3. การตรวจสอบ

เปิด Developer Tools (F12) และดู Console จะแสดง:
```
API URL: https://wk-svr01.neofelis-mooneye.ts.net/api
```

## หมายเหตุ

- ไฟล์ `.env` จะไม่ถูก commit ไปยัง Git
- สำหรับ production ให้ตั้งค่า environment variable ใน Netlify Dashboard
