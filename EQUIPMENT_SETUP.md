# Equipment Management Setup

## 📋 **Overview**
ระบบ Equipment Management ได้ถูกอัปเดตให้ดึงข้อมูล equipment จาก database แทนการใช้ hardcode

## 🔧 **Features**

### **1. Equipment API**
- **Endpoint**: `GET /api/equipment`
- **Response**: List of equipment items
- **Demo Mode**: ใช้ sample data เมื่อ database ไม่พร้อม
- **Database Mode**: ดึงจาก `TBL_IT_PCEQUIPMENT` table

### **2. Equipment Items (16 รายการ)**
- **Memory**: RAM
- **Power**: POWERSUPPLY
- **Storage**: HDD, SSD
- **Mainboard**: MOTHERBOARD
- **Processor**: CPU
- **Graphics**: GPU
- **Network**: NETWORK
- **Input**: KEYBOARD, MOUSE, SCANNER
- **Display**: MONITOR
- **Output**: PRINTER
- **Cooling**: FAN
- **Cables**: CABLE
- **Adapters**: ADAPTER

## 🗄️ **Database Setup**

### **สร้าง Table TBL_IT_PCEQUIPMENT**
```sql
-- ไฟล์: backend/scripts/create_equipment_table.sql
-- รันใน SQL Server Management Studio หรือ Azure Data Studio
```

### **Table Structure**
```sql
CREATE TABLE dbo.TBL_IT_PCEQUIPMENT (
    id INT IDENTITY(1,1) PRIMARY KEY,
    equipment NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    category NVARCHAR(50) NULL,
    created_date DATETIME DEFAULT GETDATE(),
    updated_date DATETIME DEFAULT GETDATE()
);
```

## 🎯 **Frontend Integration**

### **1. EditTicketForm**
- ✅ ใช้ `equipmentApi.getAll()` ดึงข้อมูล
- ✅ แสดง equipment buttons จาก API
- ✅ มี loading state และ fallback
- ✅ รองรับการเลือก/ยกเลิก equipment

### **2. NewRepairOrderForm**
- ✅ เพิ่ม equipment section ใหม่
- ✅ ใช้ข้อมูลจาก API เหมือน EditTicketForm
- ✅ ส่ง `items` ไปยัง API เมื่อสร้าง order

## 🚀 **Testing**

### **1. API Test**
```bash
# ทดสอบ Equipment API
curl -k https://localhost:3001/api/equipment

# Expected Response
{
  "success": true,
  "data": [
    {"equipment": "RAM"},
    {"equipment": "POWERSUPPLY"},
    ...
  ],
  "total": 16,
  "demo": true
}
```

### **2. Frontend Test**
1. เปิด `http://localhost:8082`
2. ไปที่หน้า "Create New Repair Order"
3. ตรวจสอบ Equipment/Items Details section
4. ทดสอบการเลือก/ยกเลิก equipment buttons
5. ตรวจสอบหน้า Edit Order

## 🔄 **Workflow**

### **Demo Mode (Default)**
1. Backend ใช้ sample data
2. Frontend แสดง equipment buttons
3. ทำงานได้ทันทีโดยไม่ต้อง setup database

### **Database Mode**
1. รัน SQL script สร้าง table
2. Backend จะดึงข้อมูลจาก database
3. Frontend แสดงข้อมูลจาก database
4. สามารถเพิ่ม/แก้ไข equipment ได้

## 📝 **Usage**

### **ในหน้า Create Order:**
1. เลือก equipment ที่เกี่ยวข้อง
2. ข้อมูลจะแสดงใน textarea
3. สามารถแก้ไขได้โดยตรง

### **ในหน้า Edit Order:**
1. ดู equipment ที่เลือกไว้
2. เพิ่ม/ลบ equipment ได้
3. บันทึกการเปลี่ยนแปลง

## 🛠️ **Troubleshooting**

### **API ไม่ทำงาน**
```bash
# ตรวจสอบ backend
curl -k https://localhost:3001/health

# Restart backend
cd backend && npm start
```

### **Database Error**
- ตรวจสอบ connection string
- รัน SQL script สร้าง table
- ตรวจสอบ table permissions

### **Frontend ไม่แสดง**
- ตรวจสอบ API response
- ดู browser console
- ตรวจสอบ network tab

## ✅ **Status**
- ✅ Equipment API: Working
- ✅ EditTicketForm: Updated
- ✅ NewRepairOrderForm: Updated
- ✅ Demo Mode: Working
- ✅ Database Mode: Ready
- ✅ Frontend Integration: Complete
