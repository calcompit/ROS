import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import repairOrderRoutes from './routes/repairOrders.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import subjectRoutes from './routes/subjects.js';
import departmentRoutes from './routes/departments.js';
import equipmentRoutes from './routes/equipment.js';
import databaseRoutes from './routes/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// CORS configuration for production and development
const allowedOrigins = [
  // Development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8081',
  
  // Local network patterns (be more restrictive)
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  
  // Netlify domains (replace with your actual domain)
  'https://your-app-name.netlify.app',
  /^https:\/\/.*\.netlify\.app$/,
  
  // Production domains (add your production domain here)
  // 'https://your-production-domain.com',
  
  // Add custom origins from environment variables
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // Only show CORS blocking info in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚫 CORS blocked origin: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'Access-Control-Allow-Origin']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add CORS headers middleware (backup for additional headers)
app.use((req, res, next) => {
  // Additional CORS headers if needed
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  // Get current time in Thailand timezone
  const now = new Date();
  const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  
  res.json({ 
    status: 'OK', 
    message: 'Repair Order API is running (HTTP)',
    timestamp: thailandTime.toISOString(),
    timezone: 'Asia/Bangkok'
  });
});

// WebSocket health check endpoint
app.get('/socket.io/', (req, res) => {
  // Get current time in Thailand timezone
  const now = new Date();
  const thailandTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
  
  res.json({ 
    status: 'OK', 
    message: 'Socket.IO server is running (HTTP)',
    timestamp: thailandTime.toISOString(),
    timezone: 'Asia/Bangkok'
  });
});

// API routes
app.use('/api/repair-orders', repairOrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/database', databaseRoutes);

// Global error handler
app.use((error, req, res, next) => {
  // Only show detailed error info in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Global error:', error);
  } else {
    console.error('Global error occurred');
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  // Only show 404 details in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  }
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Start server function
const startServer = async () => {
  try {
    console.log('🔄 Starting HTTP server...');
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('❌ Database connection failed');
    }
    
    // Get local IP address
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    let localIP = 'localhost';
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          localIP = net.address;
          break;
        }
      }
      if (localIP !== 'localhost') break;
    }
    
    // Only show IP addresses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API base URL: http://${localIP}:${PORT}/api`);
      console.log(`🔌 WebSocket URL: ws://${localIP}:${PORT}`);
    }
    
    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Create Socket.IO server on HTTP server
    const io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      // Only show detailed connection info in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔌 Client origin: ${socket.handshake.headers.origin}`);
        console.log(`🔌 Client user agent: ${socket.handshake.headers['user-agent']}`);
      }
      
      // Join room for real-time updates
      socket.on('join-room', (room) => {
        socket.join(room);
        // Only show room info in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`👥 Client ${socket.id} joined room: ${room}`);
        }
      });
      
      // Leave room
      socket.on('leave-room', (room) => {
        socket.leave(room);
        // Only show room info in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`👋 Client ${socket.id} left room: ${room}`);
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    // Make io available globally
    app.set('io', io);

    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
        console.log(`❌ Database connection failed`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
