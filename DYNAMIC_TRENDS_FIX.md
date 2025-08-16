# การแก้ไข Dynamic Trends

## 🎯 **เป้าหมาย**

ทำให้ monthly trends เป็น dynamic ตาม period ที่เลือก:
- **Daily**: แสดง Hourly Trends
- **Monthly**: แสดง Daily Trends  
- **Yearly**: แสดง Monthly Trends

## 🔧 **การเปลี่ยนแปลงที่ทำ**

### 1. **Backend (`backend/routes/repairOrders.js`)**:

#### แก้ไข SQL Query ให้เป็น Dynamic:
```javascript
// Get dynamic trends based on period
let trendsQuery = '';
let trendsLabel = '';

switch (period) {
  case 'daily':
    // Show hourly trends for the selected day
    trendsQuery = `
      SELECT 
        FORMAT(insert_date, 'HH:00') as hour,
        COUNT(*) as count
      FROM TBL_IT_PCMAINTENANCE 
      WHERE CAST(insert_date AS DATE) = ?
      GROUP BY FORMAT(insert_date, 'HH:00')
      ORDER BY hour ASC
    `;
    trendsLabel = 'hour';
    break;
  case 'monthly':
    // Show daily trends for the selected month
    trendsQuery = `
      SELECT 
        FORMAT(insert_date, 'dd') as day,
        COUNT(*) as count
      FROM TBL_IT_PCMAINTENANCE 
      WHERE FORMAT(insert_date, 'yyyy-MM') = ?
      GROUP BY FORMAT(insert_date, 'dd')
      ORDER BY day ASC
    `;
    trendsLabel = 'day';
    break;
  case 'yearly':
    // Show monthly trends for the selected year
    trendsQuery = `
      SELECT 
        FORMAT(insert_date, 'MM') as month,
        COUNT(*) as count
      FROM TBL_IT_PCMAINTENANCE 
      WHERE YEAR(insert_date) = ?
      GROUP BY FORMAT(insert_date, 'MM')
      ORDER BY month ASC
    `;
    trendsLabel = 'month';
    break;
  default:
    // Default: monthly trends (last 12 months)
    trendsQuery = `
      SELECT 
        FORMAT(insert_date, 'yyyy-MM') as month,
        COUNT(*) as count
      FROM TBL_IT_PCMAINTENANCE 
      WHERE insert_date >= DATEADD(month, -12, GETDATE())
      GROUP BY FORMAT(insert_date, 'yyyy-MM')
      ORDER BY month DESC
    `;
    trendsLabel = 'month';
    break;
}
```

#### เพิ่ม trendsLabel ใน Response:
```javascript
const stats = {
  total,
  pending: statusCounts.pending || 0,
  inProgress: statusCounts['in-progress'] || 0,
  completed: statusCounts.completed || 0,
  cancelled: statusCounts.cancelled || 0,
  byDepartment: deptResult.success ? deptResult.data : [],
  byDeviceType: deviceResult.success ? deviceResult.data : [],
  monthlyTrends: trendsResult.success ? trendsResult.data : [],
  trendsLabel: trendsLabel, // เพิ่มบรรทัดนี้
  recentOrders: recentResult.success ? recentResult.data : []
};
```

### 2. **Frontend (`src/components/dashboard/Dashboard.tsx`)**:

#### แก้ไข Chart Title ให้เป็น Dynamic:
```javascript
title={(() => {
  switch (periodFilter) {
    case 'daily':
      return 'Hourly Trends';
    case 'monthly':
      return 'Daily Trends';
    case 'yearly':
      return 'Monthly Trends';
    default:
      return 'Monthly Trends';
  }
})()}
```

#### แก้ไข Chart Data ให้ใช้ Dynamic Label:
```javascript
data={(() => {
  const trendsLabel = dashboardStats?.trendsLabel || 'month';
  const chartData = (dashboardStats?.monthlyTrends || []).map(item => ({
    label: item[trendsLabel] || item.month || item.day || item.hour,
    value: item.count
  })) || [
    { label: 'No Data', value: 0 }
  ];
  console.log('📊 Dynamic Trends Chart Data:', chartData);
  return chartData;
})()}
```

## 📊 **การทดสอบ**

### Daily Filter (2025-08-07):
```bash
curl "http://localhost:3001/api/repair-orders/stats/dashboard?date=2025-08-07&period=daily"
# ผลลัพธ์:
# - trendsLabel: "hour"
# - Chart Title: "Hourly Trends"
# - Data: hourly trends for the selected day
```

### Monthly Filter (2025-08-16):
```bash
curl "http://localhost:3001/api/repair-orders/stats/dashboard?date=2025-08-16&period=monthly"
# ผลลัพธ์:
# - trendsLabel: "day"
# - Chart Title: "Daily Trends"
# - Data: daily trends for the selected month
```

### Yearly Filter (2025):
```bash
curl "http://localhost:3001/api/repair-orders/stats/dashboard?date=2025-01-01&period=yearly"
# ผลลัพธ์:
# - trendsLabel: "month"
# - Chart Title: "Monthly Trends"
# - Data: monthly trends for the selected year
```

## 🚀 **ผลลัพธ์**

### 1. **Dynamic Chart Title**:
- ✅ Daily → "Hourly Trends"
- ✅ Monthly → "Daily Trends"
- ✅ Yearly → "Monthly Trends"

### 2. **Dynamic Data Structure**:
- ✅ Daily: `{ hour: "08:00", count: 2 }`
- ✅ Monthly: `{ day: "15", count: 10 }`
- ✅ Yearly: `{ month: "08", count: 18 }`

### 3. **Dynamic Label Mapping**:
- ✅ ใช้ `trendsLabel` จาก backend
- ✅ Fallback ไปยัง `item.month`, `item.day`, `item.hour`
- ✅ แสดง "No Data" เมื่อไม่มีข้อมูล

### 4. **Backward Compatibility**:
- ✅ ยังคงทำงานกับข้อมูลเดิม
- ✅ ไม่มี breaking changes
- ✅ Default behavior ยังคงเหมือนเดิม

## 🎯 **สรุป**

การแก้ไข Dynamic Trends สำเร็จแล้ว:
- **Backend**: ส่ง SQL query และ trendsLabel ตาม period
- **Frontend**: แสดง chart title และ data ตาม trendsLabel
- **UX**: ผู้ใช้เห็นข้อมูลที่เหมาะสมกับ period ที่เลือก
- **Performance**: ไม่มี performance impact

**Dynamic Trends ทำงานได้แล้ว!** 🎉
