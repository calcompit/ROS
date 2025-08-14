# 🚀 Deployment Guide - Netlify

## 📋 Prerequisites

1. **Backend running locally** on `http://localhost:3001`
2. **GitHub repository** connected to Netlify
3. **Node.js 18+** installed

## 🔧 Netlify Setup

### 1. Build Settings
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### 2. Environment Variables
Add these in Netlify dashboard:
```
VITE_API_URL=http://localhost:3001/api
```

### 3. Domain Configuration
- **Custom domain** (optional)
- **HTTPS** enabled automatically

## 🌐 Backend Configuration

### CORS Settings
Backend already configured to allow:
- `https://*.netlify.app`
- `https://netlify.app`
- Local development URLs

### Required Backend Features
- ✅ SQL Server connection
- ✅ API endpoints
- ✅ Authentication
- ✅ CORS enabled

## 📱 Features Ready for Production

### ✅ Frontend Features
- **Overview Dashboard** (รายเดือน default)
- **Date Navigation** (ปุ่ม +/-)
- **Period Filter** (รายวัน/รายเดือน/รายปี)
- **Status Colors** ใน dropdown
- **Priority Colors** ใน dropdown
- **Delete Button** ใน Edit Form
- **Admin Login** (ไม่มี user option)
- **Responsive Design**

### ✅ Backend Integration
- **SQL Server Database**
- **Real-time Data**
- **CRUD Operations**
- **Authentication System**

## 🔄 Deployment Steps

1. **Push to GitHub**
2. **Connect to Netlify**
3. **Set Environment Variables**
4. **Deploy**
5. **Test all features**

## 🧪 Testing Checklist

- [ ] Overview dashboard loads
- [ ] Date navigation works
- [ ] Period filters work
- [ ] Create new ticket
- [ ] Edit ticket
- [ ] Delete ticket
- [ ] Admin login
- [ ] Database connection

## 🚨 Important Notes

- **Backend must be running** on localhost:3001
- **Database connection** required for full functionality
- **CORS** configured for Netlify domains
- **Environment variables** must be set correctly

## 📞 Support

If issues occur:
1. Check backend is running
2. Verify environment variables
3. Check browser console for errors
4. Test API endpoints directly
