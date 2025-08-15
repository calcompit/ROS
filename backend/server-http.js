import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { createServer } from 'http';
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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration for development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow all 10.x.x.x IP addresses for local network
    if (origin.startsWith('http://10.') || origin.startsWith('https://10.')) {
      return callback(null, true);
    }
    
    // Allow specific domains if needed
    const allowedDomains = [
      'https://calcompit-ros.netlify.app',
      'https://peaceful-tapioca-c9ada4.netlify.app',
      'https://fixit-bright-dash.netlify.app',
      'https://fixit-bright-dash.onrender.com'
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
  res.json({
    status: 'OK',
    message: 'Repair Order API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API routes
app.use('/api', repairOrderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/equipment', equipmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    let dbConnected = false;
    try {
      await testConnection();
      dbConnected = true;
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.log('⚠️ Demo mode: Database connection failed');
      console.log('   Update .env with correct database settings');
    }

    // Get server IP
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
    }

    const serverIP = process.env.TAILSCALE_IP || localIP;

    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Create Socket.IO server
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      allowEIO3: true,
      transports: ['websocket', 'polling']
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

    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API base URL: http://${serverIP}:${PORT}/api`);
      console.log(`🔌 WebSocket enabled for real-time updates`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
        console.log(`⚠️ Demo mode: Update .env with correct database settings`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
