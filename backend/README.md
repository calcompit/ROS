# Repair Order Management System - Backend API

Backend API สำหรับระบบจัดการใบแจ้งซ่อม (Repair Order Management System) ที่พัฒนาด้วย Node.js, Express.js และ MySQL

## 📋 Features

- **Repair Orders Management** - CRUD operations สำหรับใบแจ้งซ่อม
- **Authentication & Authorization** - JWT-based authentication with role-based access
- **Notifications System** - ระบบแจ้งเตือนแบบ real-time
- **Dashboard Statistics** - สถิติและรายงานสำหรับ dashboard
- **RESTful API** - API design ตาม REST principles
- **Database Integration** - เชื่อมต่อกับ MySQL database
- **Security** - Helmet, CORS, Rate limiting

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, express-rate-limit
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── routes/
│   ├── repairOrders.js      # Repair orders endpoints
│   ├── auth.js              # Authentication endpoints
│   └── notifications.js    # Notifications endpoints
├── scripts/
│   └── migrate.js           # Database migration script
├── server.js                # Main server file
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables:**
   Create `.env` file:
   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=repair_order_db

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here

   # CORS Origin
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Setup database:**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE repair_order_db;

   # Run migration
   npm run migrate
   ```

4. **Start server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "full_name": "System Administrator",
      "department": "IT Department"
    },
    "token": "jwt_token_here"
  }
}
```

#### Default Users (Development)
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`
- **Technician**: username: `tech`, password: `tech123`

### Repair Orders

#### Get All Orders
```http
GET /api/repair-orders?status=pending&dept=IT&limit=10&offset=0
```

#### Get Order by ID
```http
GET /api/repair-orders/RO-2024-001
```

#### Create New Order
```http
POST /api/repair-orders
Content-Type: application/json

{
  "subject": "Laptop screen flickering",
  "name": "PC-IT-001",
  "dept": "IT Department",
  "emp": "John Doe",
  "items": "Dell Latitude 5520",
  "notes": "Screen flickers intermittently",
  "device_type": "Laptop",
  "priority": "high"
}
```

#### Update Order
```http
PUT /api/repair-orders/RO-2024-001
Content-Type: application/json

{
  "status": "in-progress",
  "emp_repair": "Tech Smith",
  "rootcause": "Faulty display cable",
  "action": "Replaced display cable"
}
```

#### Delete Order
```http
DELETE /api/repair-orders/RO-2024-001
```

#### Dashboard Statistics
```http
GET /api/repair-orders/stats/dashboard
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?userId=1&limit=20
```

#### Create Notification
```http
POST /api/notifications
Content-Type: application/json

{
  "userId": 1,
  "orderNo": "RO-2024-001",
  "title": "Order Updated",
  "message": "Your repair order has been updated",
  "type": "info"
}
```

#### Mark as Read
```http
PUT /api/notifications/1/read
```

#### Delete Notification
```http
DELETE /api/notifications/1
```

## 🗃️ Database Schema

### repair_orders
```sql
order_no VARCHAR(20) PRIMARY KEY
subject VARCHAR(255) NOT NULL
name VARCHAR(100) NOT NULL
dept VARCHAR(100) NOT NULL
emp VARCHAR(100) NOT NULL
insert_date DATETIME DEFAULT CURRENT_TIMESTAMP
items TEXT
rootcause TEXT
action TEXT
emp_repair VARCHAR(100)
last_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
status ENUM('pending', 'in-progress', 'completed', 'cancelled')
device_type VARCHAR(50)
notes TEXT
priority ENUM('low', 'medium', 'high', 'urgent')
```

### users
```sql
id INT AUTO_INCREMENT PRIMARY KEY
username VARCHAR(50) UNIQUE NOT NULL
email VARCHAR(100) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
role ENUM('admin', 'user', 'technician')
full_name VARCHAR(100)
department VARCHAR(100)
is_active BOOLEAN DEFAULT TRUE
```

### notifications
```sql
id INT AUTO_INCREMENT PRIMARY KEY
user_id INT
order_no VARCHAR(20)
title VARCHAR(255) NOT NULL
message TEXT NOT NULL
type ENUM('info', 'success', 'warning', 'error')
is_read BOOLEAN DEFAULT FALSE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, User, Technician roles
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configured for frontend origin
- **Helmet.js** - Security headers
- **Input Validation** - SQL injection prevention

## 🚀 Production Deployment

1. **Environment Setup:**
   ```bash
   NODE_ENV=production
   DB_HOST=your_production_db_host
   JWT_SECRET=strong_production_secret
   ```

2. **Database Setup:**
   - Create production database
   - Run migration script
   - Setup database indexes for performance

3. **Security:**
   - Use strong JWT secrets
   - Configure proper CORS origins
   - Setup SSL/TLS certificates
   - Use environment variables for sensitive data

## 📈 Performance Optimization

- **Database Indexes** - Optimized queries with proper indexing
- **Connection Pooling** - MySQL connection pool for better performance
- **Rate Limiting** - Prevent API abuse
- **Error Handling** - Comprehensive error handling and logging

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run migration
npm run migrate

# Check API health
curl http://localhost:5000/health
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
