# FixIt Bright Dashboard - Project Documentation

## 🎯 **Project Overview**

FixIt Bright Dashboard เป็นระบบจัดการ repair orders ที่พัฒนาด้วย React + TypeScript (Frontend) และ Node.js + Express (Backend) เชื่อมต่อกับ SQL Server database

## 🏗️ **Architecture**

### **Frontend (React + TypeScript)**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Context (Auth, Database, WebSocket, Notifications)
- **Charts**: Custom SVG Charts (Pie, Bar, Line)
- **Icons**: Lucide React

### **Backend (Node.js + Express)**
- **Framework**: Express.js
- **Database**: SQL Server (MSSQL)
- **Real-time**: Socket.IO (WebSocket)
- **Authentication**: Custom JWT-based
- **API**: RESTful endpoints

## 📁 **Project Structure**

```
fixit-bright-dash-main/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database connection config
│   │   └── demo-database.js     # Demo database (removed)
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── database.js          # Database status routes
│   │   ├── departments.js       # Department management
│   │   ├── equipment.js         # Equipment management
│   │   ├── notifications.js     # Notification system
│   │   ├── repairOrders.js      # Main repair orders API
│   │   ├── setup.js             # Setup routes
│   │   └── subjects.js          # Subject management
│   ├── scripts/
│   │   ├── create_equipment_table.sql
│   │   ├── create_repair_orders_table.sql
│   │   └── migrate.js
│   ├── server.js                # Main server file
│   └── package.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── dashboard/
│   │   │   ├── ChartCard.tsx    # Custom chart components
│   │   │   ├── Dashboard.tsx    # Main dashboard
│   │   │   └── StatsCard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   └── MobileNav.tsx
│   │   ├── notifications/
│   │   │   └── NotificationDropdown.tsx
│   │   ├── tickets/
│   │   │   ├── EditTicketForm.tsx
│   │   │   ├── NewRepairOrderForm.tsx
│   │   │   └── TicketCard.tsx
│   │   └── ui/                  # Radix UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Authentication context
│   │   ├── DatabaseContext.tsx  # Database connection context
│   │   ├── NotificationContext.tsx
│   │   └── WebSocketContext.tsx
│   ├── services/
│   │   └── api.ts               # API service functions
│   └── pages/
│       ├── Index.tsx            # Main page
│       └── NotFound.tsx
└── package.json
```

## 🔧 **Key Features Implemented**

### 1. **Data Filtering & Dashboard**
- ✅ Date-based filtering (daily, monthly, yearly)
- ✅ Dynamic trends based on selected period
- ✅ Responsive dashboard with custom charts
- ✅ Real-time data updates via WebSocket

### 2. **Responsive Design**
- ✅ iPad portrait mode optimization
- ✅ Mobile-first responsive design
- ✅ Adaptive grid layouts (2-3 columns based on screen size)

### 3. **Database Security**
- ✅ Sensitive data blurring (server, database, user)
- ✅ Admin-only access to sensitive information
- ✅ Show/Hide toggle for admin users

### 4. **Chart Enhancements**
- ✅ Custom SVG charts with animations
- ✅ Enhanced visual effects (shadows, gradients, hover)
- ✅ Responsive chart sizing
- ✅ Zero-data handling

### 5. **Authentication & Authorization**
- ✅ JWT-based authentication
- ✅ Role-based access control (admin/user)
- ✅ Secure database connection management

## 🚀 **Development Setup**

### **Backend Setup**
```bash
cd backend
npm install
npm start
```

### **Frontend Setup**
```bash
npm install
npm run dev
```

### **Environment Configuration**
- Backend runs on HTTP port 3001
- Frontend runs on port 8081
- Database: SQL Server (MSSQL)
- WebSocket: Socket.IO for real-time updates

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Repair Orders**
- `GET /api/repair-orders` - Get all repair orders
- `POST /api/repair-orders` - Create new repair order
- `PUT /api/repair-orders/:id` - Update repair order
- `GET /api/repair-orders/stats/dashboard` - Get dashboard statistics

### **Database Management**
- `GET /api/database/status` - Get database connection status
- `POST /api/database/test-connection` - Test database connection
- `POST /api/database/reconnect` - Reconnect to database

### **Other Endpoints**
- `GET /api/departments` - Get departments
- `GET /api/equipment` - Get equipment
- `GET /api/subjects` - Get subjects

## 🔒 **Security Features**

### **Database Connection Security**
- Sensitive information (server, database, user) is blurred by default
- Only admin users can view sensitive data
- Show/Hide toggle for admin users
- Secure connection management

### **Authentication Security**
- JWT token-based authentication
- Role-based access control
- Secure password handling

## 📱 **Responsive Design**

### **Breakpoints**
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (2-3 columns)
- Large Desktop: > 1536px (3 columns)

### **iPad Portrait Mode**
- Search bar on separate row from status filters
- Status filters show icon + count (horizontal layout)
- 2 columns for ticket cards
- Optimized spacing and typography

## 🎨 **UI/UX Enhancements**

### **Chart Improvements**
- Enhanced pie charts with detailed legends
- Improved bar charts with visual effects
- Better line charts with grid lines and gradients
- Responsive chart sizing
- Zero-data state handling

### **Modal Enhancements**
- Database connection modal with security features
- Responsive button layouts
- Improved padding and spacing
- Better visual hierarchy

## 🔄 **Real-time Features**

### **WebSocket Integration**
- Real-time ticket updates
- Live dashboard statistics
- Connection status monitoring
- Automatic reconnection handling

## 📈 **Data Management**

### **Filtering System**
- Date-based filtering (daily, monthly, yearly)
- Status-based filtering
- Search functionality
- Dynamic trend analysis

### **Database Operations**
- SQL Server integration
- Optimized queries for performance
- Error handling and logging
- Connection pooling

## 🛠️ **Development Tools**

### **Frontend**
- Vite for fast development
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

### **Backend**
- Node.js with Express
- SQL Server driver
- Socket.IO for real-time
- Environment-based configuration

## 📝 **Key Implementation Details**

### **Date Filtering Logic**
```javascript
// Daily filter
WHERE insert_date LIKE '2025-08-16%'

// Monthly filter
WHERE FORMAT(insert_date, 'yyyy-MM') = '2025-08'

// Yearly filter
WHERE YEAR(insert_date) = 2025
```

### **Dynamic Trends**
- Daily period → Hourly trends
- Monthly period → Daily trends
- Yearly period → Monthly trends

### **Security Implementation**
```javascript
const blurSensitiveData = (text: string) => {
  if (!isAdmin || !showSensitiveData) {
    return '••••••••••••••••';
  }
  return text;
};
```

## 🎯 **Future Enhancements**

### **Potential Improvements**
- Advanced search and filtering
- Export functionality (PDF, Excel)
- Email notifications
- Mobile app development
- Advanced analytics dashboard
- Multi-language support

### **Performance Optimizations**
- Database query optimization
- Caching strategies
- Image optimization
- Bundle size reduction

## 📚 **Documentation Files**

- `DATABASE_CONNECTION_COMPLETE.md` - Database setup guide
- `DATABASE_CONNECTION_GUIDE.md` - Connection troubleshooting
- `MACBOOK_SETUP.md` - MacBook development setup
- `SETUP_COMPLETE.md` - Project setup completion
- `SETUP_GUIDE.md` - General setup guide
- `SQL_SERVER_ONLY_MODE.md` - SQL Server configuration

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Port conflicts**: Use `lsof -ti:8081 | xargs kill -9`
2. **Database connection**: Check SQL Server configuration
3. **WebSocket issues**: Verify backend is running on correct port
4. **Build errors**: Clear node_modules and reinstall

### **Development Commands**
```bash
# Kill process on port
lsof -ti:8081 | xargs kill -9

# Restart backend
cd backend && npm start

# Restart frontend
npm run dev

# Check database connection
curl http://localhost:3001/api/database/status
```

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready
