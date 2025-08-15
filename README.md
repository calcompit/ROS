# FixIt Bright Dashboard

ระบบจัดการซ่อมบำรุงอุปกรณ์แบบ Real-time ระหว่าง MacBook (Frontend) และ Windows (Backend)

## 🚀 Quick Start

### 1. Setup Tailscale
- ติดตั้ง Tailscale บนทั้ง MacBook และ Windows
- เชื่อมต่อเข้ากับ Tailscale network เดียวกัน

### 2. Setup SSH (One-time)
```bash
# MacBook
chmod +x setup-ssh-mac.sh
./setup-ssh-mac.sh

# Windows (Run as Administrator)
setup-ssh-windows.bat
```

### 3. Setup Environment
```bash
# MacBook
cp env.macbook.example .env.local

# Windows
copy env.windows.example .env
```

### 4. Start Development
```bash
# MacBook - Frontend
chmod +x start-frontend-mac.sh
./start-frontend-mac.sh

# Windows - Backend
auto-pull-windows.bat
```

## 📁 Scripts

### MacBook Scripts
- `start-frontend-mac.sh` - รัน Frontend ที่ port 8081
- `sync-to-windows.sh` - Push code ไป Git และ sync ไป Windows
- `setup-ssh-mac.sh` - ตั้งค่า SSH connection
- `start-backend-windows-ssh.sh` - รัน Backend บน Windows ผ่าน SSH

### Windows Scripts
- `start-backend-windows.bat` - รัน Backend ที่ port 3001
- `run-backend-windows.bat` - รัน Backend แบบ background
- `auto-pull-windows.bat` - Pull code จาก Git และ restart backend
- `setup-ssh-windows.bat` - ตั้งค่า SSH server

## 🔄 Development Workflow

1. **แก้ไข Frontend** (MacBook) → Auto-reload ที่ port 8081
2. **แก้ไข Backend** (MacBook) → รัน `./sync-to-windows.sh`
3. **แก้ไข Backend** (Windows) → รัน `auto-pull-windows.bat`

## 📖 Documentation

ดูรายละเอียดเพิ่มเติมได้ที่ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🌐 URLs

- **Frontend**: http://localhost:8081
- **Backend API**: https://10.51.101.49:3001/api
- **Backend Health**: https://10.51.101.49:3001/health
