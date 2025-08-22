import { executeQuery, testConnection } from '../config/database.js';

// Database migration script
const createTables = async () => {
  console.log('🚀 Starting database migration...');

  // Test connection first
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Migration failed: Cannot connect to database');
    process.exit(1);
  }

  try {
    // Check if table exists
    const checkTableQuery = `
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'dbo' 
      AND TABLE_NAME = 'TBL_IT_PCMAINTENANCE'
    `;
    
    const tableExists = await executeQuery(checkTableQuery);
    
    if (tableExists.success && tableExists.data[0].count > 0) {
      console.log('✅ Table dbo.TBL_IT_PCMAINTENANCE already exists');
      return;
    }

    // Create repair_orders table if it doesn't exist
    const createRepairOrdersTable = `
      CREATE TABLE dbo.TBL_IT_PCMAINTENANCE (
        order_no NVARCHAR(20) PRIMARY KEY,
        subject NVARCHAR(255) NOT NULL,
        name NVARCHAR(100) NOT NULL, -- PC/Device name
        dept NVARCHAR(100) NOT NULL, -- Department
        emp NVARCHAR(100) NOT NULL, -- Employee who reported
        insert_date DATETIME2 NOT NULL DEFAULT DATEADD(HOUR, 7, GETUTCDATE()),
        items NTEXT, -- Equipment/items details
        rootcause NTEXT, -- Root cause analysis
        emprepair NVARCHAR(100), -- Technician assigned (renamed from emp_repair)
        last_date DATETIME2 NOT NULL DEFAULT DATEADD(HOUR, 7, GETUTCDATE()),
        status NVARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in-progress, completed, cancelled
        created_at DATETIME2 DEFAULT DATEADD(HOUR, 7, GETUTCDATE()),
        updated_at DATETIME2 DEFAULT DATEADD(HOUR, 7, GETUTCDATE())
      );
      
      -- Create indexes
      CREATE INDEX idx_status ON dbo.TBL_IT_PCMAINTENANCE (status);
      CREATE INDEX idx_dept ON dbo.TBL_IT_PCMAINTENANCE (dept);
      CREATE INDEX idx_emprepair ON dbo.TBL_IT_PCMAINTENANCE (emprepair);
      CREATE INDEX idx_insert_date ON dbo.TBL_IT_PCMAINTENANCE (insert_date);
    `;

    // Create users table for authentication
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user', 'technician') NOT NULL DEFAULT 'user',
        full_name VARCHAR(100),
        department VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create notifications table
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        order_no VARCHAR(20),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_no) REFERENCES repair_orders(order_no) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_order_no (order_no),
        INDEX idx_is_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Execute table creation
    console.log('📋 Creating repair_orders table...');
    await executeQuery(createRepairOrdersTable);
    
    console.log('👥 Creating users table...');
    await executeQuery(createUsersTable);
    
    console.log('🔔 Creating notifications table...');
    await executeQuery(createNotificationsTable);

    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Insert sample data
const insertSampleData = async () => {
  console.log('📊 Inserting sample data...');

  try {
    // Sample repair orders
    const sampleOrders = [
      {
        order_no: 'RO-2024-001',
        subject: 'Laptop screen flickering during graphics applications',
        name: 'PC-IT-001',
        dept: 'IT Department',
        emp: 'John Doe',
        items: 'Dell Latitude 5520, Intel Graphics, 16GB RAM, Windows 11 Pro',
        rootcause: 'Graphics driver compatibility issue with updated Windows display drivers',
        action: 'Updated graphics drivers, ran display diagnostics, tested with multiple applications',
        emp_repair: 'Smith Wilson',
        status: 'in-progress',
        device_type: 'Laptop',
        notes: 'Customer reported issue occurs mainly with Adobe Creative Suite',
        priority: 'high'
      },
      {
        order_no: 'RO-2024-002',
        subject: 'Network printer not responding to print jobs',
        name: 'PRINTER-ACC-02',
        dept: 'Accounting',
        emp: 'Jane Smith',
        items: 'HP LaserJet Pro 4050dn, Network Connection, Ethernet',
        rootcause: '',
        action: '',
        emp_repair: '',
        status: 'pending',
        device_type: 'Printer',
        notes: 'Printer shows online status but queue is stuck',
        priority: 'medium'
      }
    ];

    for (const order of sampleOrders) {
      const insertQuery = `
        INSERT IGNORE INTO repair_orders 
        (order_no, subject, name, dept, emp, items, rootcause, action, emp_repair, status, device_type, notes, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(insertQuery, [
        order.order_no, order.subject, order.name, order.dept, order.emp,
        order.items, order.rootcause, order.action, order.emp_repair,
        order.status, order.device_type, order.notes, order.priority
      ]);
    }

    console.log('✅ Sample data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Failed to insert sample data:', error);
  }
};

// Run migration
const runMigration = async () => {
  await createTables();
  await insertSampleData();
  process.exit(0);
};

runMigration();
