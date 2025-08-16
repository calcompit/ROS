# การแก้ไขปัญหาการกรองข้อมูล Dashboard

## ปัญหาที่พบ
1. **API `getStats` ไม่ส่งพารามิเตอร์ `date` และ `period`** - ทำให้ข้อมูลที่ได้เหมือนกันทุกครั้ง
2. **Frontend ไม่ส่งพารามิเตอร์การกรองไปยัง backend** - แม้ว่า backend จะรองรับแล้ว
3. **ข้อมูลไม่อัปเดตเมื่อเปลี่ยน filter** - เนื่องจากไม่มี useEffect ที่เหมาะสม

## การแก้ไขที่ทำ

### 1. แก้ไข API Service (`src/services/api.ts`)

#### เพิ่มพารามิเตอร์ให้กับ `getStats` method:
```typescript
getStats: async (params?: { date?: string; period?: string }): Promise<ApiResponse<...>> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
  }
  
  const queryString = searchParams.toString();
  const endpoint = `/repair-orders/stats/dashboard${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<any>(endpoint);
}
```

#### เพิ่มพารามิเตอร์ให้กับ `getAll` method:
```typescript
getAll: async (params?: {
  status?: string;
  dept?: string;
  emprepair?: string;
  limit?: number;
  offset?: number;
  date?: string;
  period?: string;
}): Promise<ApiResponse<RepairOrder[]>> => {
  // ... existing code
}
```

### 2. แก้ไข Backend Route (`backend/routes/repairOrders.js`)

#### เพิ่มการรองรับการกรองตามวันที่ใน endpoint `/repair-orders`:
```javascript
const { status, dept, emprepair, priority, limit = 50, offset = 0, date, period } = req.query;

// Add date filter based on period
if (date && period) {
  const selectedDate = new Date(date);
  
  switch (period) {
    case 'daily':
      sqlQuery += ` AND CAST(insert_date AS DATE) = CAST(?)`;
      params.push(date);
      break;
    case 'monthly':
      const monthYear = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      sqlQuery += ` AND FORMAT(insert_date, 'yyyy-MM') = ?`;
      params.push(monthYear);
      break;
    case 'yearly':
      sqlQuery += ` AND YEAR(insert_date) = ?`;
      params.push(selectedDate.getFullYear());
      break;
  }
}
```

### 3. แก้ไข Dashboard Component (`src/components/dashboard/Dashboard.tsx`)

#### อัปเดต `fetchDashboardStats` เพื่อส่งพารามิเตอร์:
```typescript
const fetchDashboardStats = useCallback(async () => {
  try {
    setStatsLoading(true);
    console.log('📊 Fetching dashboard stats with filters:', {
      date: dateFilter,
      period: periodFilter
    });
    const response = await repairOrdersApi.getStats({
      date: dateFilter,
      period: periodFilter
    });
    // ... rest of the function
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  } finally {
    setStatsLoading(false);
  }
}, [dateFilter, periodFilter]);
```

#### อัปเดต `fetchTickets` เพื่อส่งพารามิเตอร์การกรอง:
```typescript
const fetchTickets = useCallback(async () => {
  try {
    // Prepare filter parameters
    const filterParams: any = {};
    if (dateFilter && periodFilter) {
      filterParams.date = dateFilter;
      filterParams.period = periodFilter;
    }
    if (statusFilter && statusFilter !== 'all') {
      filterParams.status = statusFilter;
    }
    
    console.log('📡 Filter params:', filterParams);
    const response = await repairOrdersApi.getAll(filterParams);
    // ... rest of the function
  } catch (err) {
    console.error('❌ Error fetching tickets:', err);
  } finally {
    setLoading(false);
  }
}, [dateFilter, periodFilter, statusFilter]);
```

#### เพิ่ม useEffect เพื่ออัปเดตข้อมูลเมื่อ filter เปลี่ยน:
```typescript
// Load tickets and stats on component mount and when filters change
useEffect(() => {
  fetchTickets();
  fetchDashboardStats();
}, [dateFilter, periodFilter, statusFilter]);

// Update refs when functions change
useEffect(() => {
  fetchTicketsRef.current = fetchTickets;
  fetchDashboardStatsRef.current = fetchDashboardStats;
}, [fetchTickets, fetchDashboardStats]);
```

## ผลลัพธ์ที่คาดหวัง

1. **ข้อมูลจะอัปเดตตาม filter ที่เลือก** - เมื่อเปลี่ยนวันที่หรือช่วงเวลา ข้อมูลจะเปลี่ยนตาม
2. **API calls จะส่งพารามิเตอร์ที่ถูกต้อง** - log จะแสดงพารามิเตอร์ที่ส่งไป
3. **ข้อมูลจะสอดคล้องกัน** - จำนวน tickets และ stats จะตรงกัน
4. **Performance ดีขึ้น** - ไม่ต้องโหลดข้อมูลทั้งหมดทุกครั้ง

## การทดสอบ

1. เปิดแอปพลิเคชัน
2. เปลี่ยนวันที่ใน filter
3. เปลี่ยนช่วงเวลา (daily/monthly/yearly)
4. ตรวจสอบ console log ว่าพารามิเตอร์ถูกส่งไปหรือไม่
5. ตรวจสอบว่าข้อมูลเปลี่ยนตาม filter หรือไม่
