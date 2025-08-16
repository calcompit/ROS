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
  
  // Local network (10.x.x.x)
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  
  // Netlify domains
  'https://calcompit-ros.netlify.app',
  /^https:\/\/.*\.netlify\.app$/,
  
  // Production domains (add your production domain here)
  // 'https://your-production-domain.com',
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
      console.log(`🚫 CORS blocked origin: ${origin}`);
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
  res.json({ 
    status: 'OK', 
    message: 'Repair Order API is running',
    timestamp: new Date().toISOString()
  });
});

// WebSocket health check endpoint
app.get('/socket.io/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Socket.IO server is running',
    timestamp: new Date().toISOString()
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
    // Test database connection
    testConnection().then(connected => {
      if (connected) {
        console.log('✅ Database connected successfully');
      } else {
        console.error('❌ Database connection failed');
      }
    }).catch(error => {
      console.error('❌ Database connection error:', error.message);
    });



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
    const serverIP = localIP; // Use detected local IP for network access

    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Create Socket.IO server on HTTP server
    const io = new Server(httpServer, {
      cors: {
        origin: true,
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
      
      // Join room for real-time updates
      socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`👥 Client ${socket.id} joined room: ${room}`);
      });
      
      // Leave room
      socket.on('leave-room', (room) => {
        socket.leave(room);
        console.log(`👋 Client ${socket.id} left room: ${room}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    // Make io available globally
    app.set('io', io);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API base URL: http://${serverIP}:${PORT}/api`);
      console.log(`🔌 WebSocket URL: ws://${serverIP}:${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
    
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
