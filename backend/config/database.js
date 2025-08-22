import sql from 'mssql';

let pool = null;

// Database configuration
const config = {
  server: process.env.DB_SERVER || '10.53.64.205',
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || 'ccet',
  password: process.env.DB_PASSWORD || '!qaz7410',
  database: process.env.DB_NAME || 'mes',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 60000,
    connectionTimeout: 60000,
    server: process.env.DB_SERVER || '10.53.64.205',
    port: parseInt(process.env.DB_PORT) || 1433,
    connectTimeout: 60000,
    cancelTimeout: 5000,
    packetSize: 4096,
    useUTC: false,
    abortTransactionOnError: true,
    isolationLevel: 2
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
  },
  stream: false,
  parseJSON: false,
  arrayRowMode: false,
  validateConnection: true
};

// Test database connection
export const testConnection = async () => {
  try {
    console.log('🔄 Attempting to connect to SQL Server... (Attempt 1/4)');
    console.log('📍 Server:', config.server);
    console.log('🔑 User:', config.user);
    console.log('🗄️ Database:', config.database);
    console.log('⏱️ Timeout:', config.options.requestTimeout + 'ms');

    pool = await sql.connect(config);
    console.log('✅ SQL Server connected successfully');
    return true;
  } catch (error) {
    console.error('❌ SQL Server connection failed:', error.message);
    return false;
  }
};

// Get database pool
export const getPool = () => {
  return pool;
};



// Execute query - SQL Server only
export const executeQuery = async (sqlQuery, params = []) => {
  try {
    // Try SQL Server only
    if (pool && pool.connected) {
      const request = pool.request();
      
      // Handle both array and object parameters
      if (Array.isArray(params)) {
        // Convert array to named parameters
        params.forEach((param, index) => {
          request.input(`param${index + 1}`, param);
        });
        // Replace ? with param1, param2, etc.
        let paramIndex = 1;
        sqlQuery = sqlQuery.replace(/\?/g, () => `@param${paramIndex++}`);
      } else if (typeof params === 'object' && Object.keys(params).length > 0) {
        // Add named parameters
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      
      const result = await request.query(sqlQuery);
      return { success: true, data: result.recordset, demo: false };
    }
  } catch (error) {
    console.error('❌ SQL Server query failed:', error.message);
  }

  return { success: false, error: 'SQL Server not available' };
};

// Execute non-query operations (INSERT, UPDATE, DELETE) - SQL Server only
export const executeNonQuery = async (sqlQuery, params = []) => {
  try {
    // Try SQL Server only
    if (pool && pool.connected) {
      const request = pool.request();
      
      // Handle both array and object parameters
      if (Array.isArray(params)) {
        // Convert array to named parameters
        params.forEach((param, index) => {
          request.input(`param${index + 1}`, param);
        });
        // Replace ? with param1, param2, etc.
        let paramIndex = 1;
        sqlQuery = sqlQuery.replace(/\?/g, () => `@param${paramIndex++}`);
      } else if (typeof params === 'object' && Object.keys(params).length > 0) {
        // Add named parameters
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
      }
      
      const result = await request.query(sqlQuery);
      return { success: true, data: result, demo: false };
    }
  } catch (error) {
    console.error('❌ SQL Server operation failed:', error.message);
  }

  return { success: false, error: 'SQL Server not available' };
};

// Close all database connections
export const closeConnections = async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('🔒 SQL Server connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};
