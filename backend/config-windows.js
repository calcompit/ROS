// Configuration for Windows machine - Auto-detect IP
export const config = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration (MySQL)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'repair_orders',
  DB_PORT: process.env.DB_PORT || 3306,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS Configuration
  ALLOWED_ORIGINS: [
    'https://calcompit-ros.netlify.app',
    'https://peaceful-tapioca-c9ada4.netlify.app',
    'https://fixit-bright-dash.netlify.app',
    'https://fixit-bright-dash.onrender.com',
    'http://localhost:5173',
    'https://localhost:5173'
  ],
  
  // SSL Configuration
  SSL_KEY_PATH: process.env.SSL_KEY_PATH || './ssl/key.pem',
  SSL_CERT_PATH: process.env.SSL_CERT_PATH || './ssl/cert.pem',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  
  // Server IP - Auto-detect
  SERVER_IP: process.env.SERVER_IP || 'localhost'
};

export default config;
