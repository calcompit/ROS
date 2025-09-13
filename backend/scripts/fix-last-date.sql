-- Fix null last_date values in existing records
-- This script updates all records where last_date is NULL to use insert_date

UPDATE TBL_IT_PCMAINTENANCE 
SET last_date = insert_date 
WHERE last_date IS NULL;

-- Also update records where last_date is empty string
UPDATE TBL_IT_PCMAINTENANCE 
SET last_date = insert_date 
WHERE last_date = '' OR last_date = '';

-- Show the results
SELECT 
    order_no,
    subject,
    insert_date,
    last_date,
    CASE 
        WHEN last_date IS NULL THEN 'NULL'
        WHEN last_date = '' THEN 'EMPTY'
        ELSE 'OK'
    END as status
FROM TBL_IT_PCMAINTENANCE 
ORDER BY insert_date DESC;
