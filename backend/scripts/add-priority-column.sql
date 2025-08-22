-- Add priority column to existing TBL_IT_PCMAINTENANCE table
-- This script adds the priority field to existing tables

-- Check if priority column exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'TBL_IT_PCMAINTENANCE' 
    AND COLUMN_NAME = 'priority'
)
BEGIN
    -- Add priority column with default value 'medium'
    ALTER TABLE TBL_IT_PCMAINTENANCE 
    ADD priority NVARCHAR(20) DEFAULT 'medium';
    
    -- Update existing records to have 'medium' priority
    UPDATE TBL_IT_PCMAINTENANCE 
    SET priority = 'medium' 
    WHERE priority IS NULL;
    
    -- Create index for priority column
    CREATE INDEX idx_priority ON TBL_IT_PCMAINTENANCE (priority);
    
    PRINT '✅ Priority column added successfully';
END
ELSE
BEGIN
    PRINT 'ℹ️ Priority column already exists';
END

-- Check if notes column exists
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'TBL_IT_PCMAINTENANCE' 
    AND COLUMN_NAME = 'notes'
)
BEGIN
    -- Add notes column
    ALTER TABLE TBL_IT_PCMAINTENANCE 
    ADD notes NTEXT;
    
    PRINT '✅ Notes column added successfully';
END
ELSE
BEGIN
    PRINT 'ℹ️ Notes column already exists';
END

-- Show current table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'TBL_IT_PCMAINTENANCE'
ORDER BY ORDINAL_POSITION;
