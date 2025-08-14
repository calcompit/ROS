import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import repairOrderRoutes from './routes/repairOrders.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import subjectRoutes from './routes/subjects.js';
import departmentRoutes from './routes/departments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - Allow all Netlify domains
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow all netlify.app domains
    if (origin.endsWith('.netlify.app') || origin === 'https://netlify.app') {
      return callback(null, true);
    }
    
    // Allow all pages.dev domains (Cloudflare Pages)
    if (origin.endsWith('.pages.dev')) {
      return callback(null, true);
    }
    
    // Allow specific domains if needed
    const allowedDomains = [
      'https://peaceful-tapioca-c9ada4.netlify.app',
      'https://calcompit-ros.netlify.app',
      'https://ros-4hr.pages.dev'
    ];
    
    if (allowedDomains.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log(`🚫 Blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Repair Order API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/repair-orders', repairOrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection (non-blocking)
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Database connection failed - running in demo mode');
      console.warn('⚠️ API will return sample data instead of real database');
    } else {
      console.log('✅ Database connected successfully');
    }

    // Get local IP address
    const getLocalIP = async () => {
      const { networkInterfaces } = await import('os');
      const nets = networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            return net.address;
          }
        }
      }
      return 'localhost';
    };

    const localIP = await getLocalIP();

    // Create self-signed certificate for development
    try {
      const options = {
        key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
      };

      https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 HTTPS Server running on port ${PORT}`);
        console.log(`📍 Health check: https://localhost:${PORT}/health`);
        console.log(`🌐 API base URL: https://${localIP}:${PORT}/api`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        if (!dbConnected) {
          console.log(`⚠️ Demo mode: Update .env with correct database settings`);
        }
      });
    } catch (sslError) {
      console.error('❌ SSL certificate not found. Creating new one...');
      
      // Create SSL directory if it doesn't exist
      const sslDir = path.join(__dirname, 'ssl');
      if (!fs.existsSync(sslDir)) {
        fs.mkdirSync(sslDir, { recursive: true });
      }

             // Generate self-signed certificate using Node.js
       const { execSync } = await import('child_process');
      try {
        execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${path.join(sslDir, 'key.pem')}" -out "${path.join(sslDir, 'cert.pem')}" -days 365 -nodes -subj "/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost"`, { stdio: 'inherit' });
        
        // Retry with new certificate
        const options = {
          key: fs.readFileSync(path.join(sslDir, 'key.pem')),
          cert: fs.readFileSync(path.join(sslDir, 'cert.pem'))
        };

        https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 HTTPS Server running on port ${PORT}`);
          console.log(`📍 Health check: https://localhost:${PORT}/health`);
          console.log(`🌐 API base URL: https://${localIP}:${PORT}/api`);
          console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
          if (!dbConnected) {
            console.log(`⚠️ Demo mode: Update .env with correct database settings`);
          }
        });
      } catch (genError) {
        console.error('❌ Failed to generate SSL certificate. Please install OpenSSL or use mkcert.');
        console.error('📝 Manual SSL setup required:');
        console.error('   1. Install OpenSSL for Windows');
        console.error('   2. Run: openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=TH/ST=Bangkok/L=Bangkok/O=TechFix/OU=IT/CN=localhost"');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
