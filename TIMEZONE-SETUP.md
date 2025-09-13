# 🕐 Timezone Setup for Thailand

## Overview
This project has been configured to display all dates and times in Thailand timezone (UTC+7 / Asia/Bangkok).

## Changes Made

### 1. Database Configuration
- **File**: `backend/config/database.js`
- **Change**: Set `useUTC: false` to use local timezone instead of UTC

### 2. SQL Server Date Functions
- **Files**: `backend/routes/repairOrders.js`, `backend/scripts/migrate.js`
- **Change**: Replace `GETDATE()` with `DATEADD(HOUR, 7, GETUTCDATE())` to add 7 hours for Thailand timezone

### 3. Frontend Date Formatting
- **File**: `src/lib/utils.ts`
- **Added**: Thailand timezone utility functions:
  - `formatThailandDate()` - Format date in Thai locale
  - `formatThailandDateTime()` - Format date and time in Thai locale
  - `formatThailandRelativeTime()` - Format relative time in Thai (e.g., "2 ชั่วโมงที่แล้ว")
  - `getThailandNow()` - Get current time in Thailand
  - `toThailandTime()` - Convert date to Thailand timezone

### 4. Component Updates
- **File**: `src/components/tickets/TicketCard.tsx`
- **Change**: Use `formatThailandDate()` and `formatThailandDateTime()` for date display

- **File**: `src/components/notifications/NotificationDropdown.tsx`
- **Change**: Use `formatThailandRelativeTime()` for "time ago" display

### 5. Backend Health Checks
- **File**: `backend/server-http.js`
- **Change**: Health check endpoints now return timestamps in Thailand timezone

### 6. Environment Variables
- **File**: `backend/.env`
- **Added**: `TZ=Asia/Bangkok` to set server timezone

## Date Format Examples

### Before (UTC)
```
2024-01-15T10:30:00.000Z
```

### After (Thailand Time)
```
15/01/2567 17:30:00
```

### Relative Time Examples
- English: "2 hours ago"
- Thai: "2 ชั่วโมงที่แล้ว"

## Testing Timezone

### 1. Check Current Time
```bash
# Backend health check
curl http://localhost:3001/health

# Should return:
{
  "status": "OK",
  "timestamp": "2024-01-15T17:30:00.000+07:00",
  "timezone": "Asia/Bangkok"
}
```

### 2. Check Frontend Display
- Open the application
- Create a new repair order
- Check that the date/time shows in Thailand format
- Check notifications show relative time in Thai

### 3. Database Verification
```sql
-- Check current time in database
SELECT GETDATE() as ServerTime, 
       DATEADD(HOUR, 7, GETUTCDATE()) as ThailandTime

-- Check repair orders timestamps
SELECT order_no, insert_date, last_date 
FROM TBL_IT_PCMAINTENANCE 
ORDER BY insert_date DESC
```

## Troubleshooting

### If times still show in UTC:
1. **Check environment variable**: Ensure `TZ=Asia/Bangkok` is set in `backend/.env`
2. **Restart backend**: Restart the Node.js server after changing environment variables
3. **Clear browser cache**: Clear browser cache and reload the page
4. **Check database**: Verify SQL Server is using the correct timezone

### If relative times show in English:
1. **Check browser locale**: Ensure browser supports Thai locale
2. **Check utility functions**: Verify `formatThailandRelativeTime()` is being used
3. **Check imports**: Ensure `@/lib/utils` is properly imported

## Notes
- All timestamps are stored in UTC in the database but displayed in Thailand timezone
- The system automatically converts between UTC and Thailand time (UTC+7)
- Thai locale (`th-TH`) is used for date formatting
- Relative times are displayed in Thai language
