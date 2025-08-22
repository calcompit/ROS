import { executeQuery, executeNonQuery } from '../config/database.js';

async function addPriorityColumn() {
  try {
    console.log('🔧 Adding priority column to TBL_IT_PCMAINTENANCE...');
    
    // Check if column exists
    const checkResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'TBL_IT_PCMAINTENANCE' 
      AND COLUMN_NAME = 'priority'
    `);
    
    if (checkResult.success && checkResult.data[0].count > 0) {
      console.log('✅ Priority column already exists');
      return;
    }
    
    // Add priority column
    const addResult = await executeNonQuery(`
      ALTER TABLE TBL_IT_PCMAINTENANCE 
      ADD priority NVARCHAR(20) DEFAULT 'medium'
    `);
    
    if (addResult.success) {
      console.log('✅ Priority column added successfully');
      
      // Update existing records
      const updateResult = await executeNonQuery(`
        UPDATE TBL_IT_PCMAINTENANCE 
        SET priority = 'medium' 
        WHERE priority IS NULL
      `);
      
      if (updateResult.success) {
        console.log('✅ Existing records updated with medium priority');
      }
      
      // Create index
      const indexResult = await executeNonQuery(`
        CREATE INDEX idx_priority ON TBL_IT_PCMAINTENANCE (priority)
      `);
      
      if (indexResult.success) {
        console.log('✅ Priority index created');
      }
      
    } else {
      console.error('❌ Failed to add priority column:', addResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error adding priority column:', error);
  }
}

addPriorityColumn();
