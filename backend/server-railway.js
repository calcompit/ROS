import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Security middleware
app.use(helmet());
app.use(limiter);

// CORS configuration for Railway
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
    
    // Allow Railway domains
    if (origin.includes('.railway.app')) {
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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import ticketsRoutes from './routes/tickets.js';
import subjectsRoutes from './routes/subjects.js';
import departmentsRoutes from './routes/departments.js';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/departments', departmentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Database connection status
let dbConnected = false;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbTest = await testConnection();
    dbConnected = dbTest.success;
    
    if (dbConnected) {
      console.log('✅ Database connected successfully');
    } else {
      console.log('⚠️ Database connection failed - running in demo mode');
    }

    // Start HTTP server (Railway handles HTTPS)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
        console.log(`⚠️ Demo mode: Update environment variables with correct database settings`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
