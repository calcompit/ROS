# Computer Change Tracker

ระบบติดตามการเปลี่ยนแปลงคอมพิวเตอร์แบบ Real-time

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```bash
VITE_API_URL=https://wk-svr01.neofelis-mooneye.ts.net/api
```

## 🛠️ Technologies

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS
- **Deployment:** Netlify

## 📁 Project Structure

```
src/
├── components/     # UI Components
├── pages/         # Page Components
├── lib/           # Utilities & API
└── hooks/         # Custom Hooks
```

## 🌐 Deployment

เว็บไซต์: [https://calcompit-ros.netlify.app](https://calcompit-ros.netlify.app)

## 📝 API Configuration

API URL: `https://wk-svr01.neofelis-mooneye.ts.net/api`

สำหรับ Netlify ให้ตั้งค่า Environment Variables:
- `VITE_API_URL`: `https://wk-svr01.neofelis-mooneye.ts.net/api`

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
