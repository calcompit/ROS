import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  server: process.env.DB_SERVER || '10.53.64.205',
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || 'ccet',
  password: process.env.DB_PASSWORD || '!qaz7410',
  database: process.env.DB_NAME || 'mes',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true',
    enableArithAbort: true,
    requestTimeout: 60000,
    connectionTimeout: 60000,
    server: process.env.DB_SERVER || '10.53.64.205',
    port: parseInt(process.env.DB_PORT) || 1433,
    connectTimeout: 60000,
    cancelTimeout: 5000,
    packetSize: 4096,
    useUTC: true,
    abortTransactionOnError: true,
    isolationLevel: sql.ISOLATION_LEVEL.READ_COMMITTED
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 60000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 60000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
};

// Create connection pool
let pool;

// Initialize connection pool with retry
export const initializePool = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    console.log(`🔄 Attempting to connect to SQL Server... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
    console.log('📍 Server:', dbConfig.server);
    console.log('🔑 User:', dbConfig.user);
    console.log('🗄️ Database:', dbConfig.database);
    console.log('⏱️ Timeout:', dbConfig.options.connectionTimeout + 'ms');
    
    pool = await sql.connect(dbConfig);
    console.log('✅ SQL Server connected successfully');
    return true;
  } catch (error) {
    console.error(`❌ SQL Server connection failed (Attempt ${retryCount + 1}):`, error.message);
    console.error('🔍 Error details:', {
      code: error.code,
      number: error.number,
      state: error.state,
      originalError: error.originalError
    });
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying in 5 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return initializePool(retryCount + 1);
    }
    
    return false;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    if (!pool) {
      return await initializePool();
    }
    // Test with a simple query
    await pool.request().query('SELECT 1 as test');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
};

// Execute query with error handling
export const executeQuery = async (query, params = {}) => {
  try {
    if (!pool) {
      const connected = await initializePool();
      if (!connected) {
        throw new Error('Failed to initialize database connection');
      }
    }

    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });

    const result = await request.query(query);
    return { success: true, data: result.recordset };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
};

// Get connection pool
export const getPool = () => pool;

export default { initializePool, testConnection, executeQuery, getPool };
