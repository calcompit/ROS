import { executeQuery } from './config/database.js';

async function setupUsers() {
  try {
    console.log('🔄 Creating TBL_IT_MAINTAINUSER table...');
    
    // Create table
    const createTableSQL = `
      IF OBJECT_ID('dbo.TBL_IT_MAINTAINUSER', 'U') IS NOT NULL
        DROP TABLE dbo.TBL_IT_MAINTAINUSER;
      
      CREATE TABLE dbo.TBL_IT_MAINTAINUSER (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100) NULL,
        role NVARCHAR(20) DEFAULT 'admin',
        department NVARCHAR(100) DEFAULT 'IT Department',
        is_active BIT DEFAULT 1,
        created_date DATETIME DEFAULT GETDATE(),
        updated_date DATETIME DEFAULT GETDATE()
      );
    `;
    
    await executeQuery(createTableSQL);
    console.log('✅ Table created successfully');
    
    // Insert admin user
    console.log('🔄 Inserting admin user...');
    const insertUserSQL = `
      INSERT INTO dbo.TBL_IT_MAINTAINUSER (username, password, full_name, role, department) 
      VALUES ('admin', '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2', 'System Administrator', 'admin', 'IT Department');
    `;
    
    await executeQuery(insertUserSQL);
    console.log('✅ Admin user created successfully');
    
    // Verify
    const verifySQL = 'SELECT * FROM dbo.TBL_IT_MAINTAINUSER';
    const result = await executeQuery(verifySQL);
    console.log('📊 Users in database:', result.recordset);
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
  }
}

setupUsers();
