import sql from 'mssql';

const config = {
  server: '10.53.64.205',
  database: 'ROS',
  user: 'sa',
  password: 'Calcomp@2024',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 60000,
    connectionTimeout: 60000,
    server: '10.53.64.205',
    port: 1433,
    connectTimeout: 60000,
    cancelTimeout: 5000,
    packetSize: 4096,
    useUTC: false,
    abortTransactionOnError: true,
    isolationLevel: 2
  }
};

async function addPriorityColumn() {
  try {
    console.log('🔧 Connecting to database...');
    const pool = await sql.connect(config);
    console.log('✅ Connected to database');

    // Check if column exists
    console.log('🔍 Checking if priority column exists...');
    const checkResult = await pool.request().query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'TBL_IT_PCMAINTENANCE' 
      AND COLUMN_NAME = 'priority'
    `);
    
    if (checkResult.recordset[0].count > 0) {
      console.log('✅ Priority column already exists');
      return;
    }
    
    // Add priority column
    console.log('🔧 Adding priority column...');
    await pool.request().query(`
      ALTER TABLE TBL_IT_PCMAINTENANCE 
      ADD priority NVARCHAR(20) DEFAULT 'medium'
    `);
    console.log('✅ Priority column added successfully');
    
    // Update existing records
    console.log('🔧 Updating existing records...');
    await pool.request().query(`
      UPDATE TBL_IT_PCMAINTENANCE 
      SET priority = 'medium' 
      WHERE priority IS NULL
    `);
    console.log('✅ Existing records updated with medium priority');
    
    // Create index
    console.log('🔧 Creating priority index...');
    await pool.request().query(`
      CREATE INDEX idx_priority ON TBL_IT_PCMAINTENANCE (priority)
    `);
    console.log('✅ Priority index created');
    
    await pool.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addPriorityColumn();
