import express from 'express';
import { testConnection, closeConnections, getPool } from '../config/database.js';

const router = express.Router();

// Get database connection status
router.get('/status', async (req, res) => {
  try {
    const pool = getPool();
    const isConnected = pool && pool.connected;
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        type: isConnected ? 'sqlserver' : 'demo',
        server: process.env.DB_SERVER || '10.53.64.205',
        database: process.env.DB_NAME || 'mes',
        user: process.env.DB_USER || 'ccet'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get database status',
      message: error.message
    });
  }
});

// Test database connection
router.post('/test-connection', async (req, res) => {
  try {
    console.log('🔄 Testing database connection...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Database connection successful',
        data: {
          connected: true,
          type: 'sqlserver',
          server: process.env.DB_SERVER || '10.53.64.205',
          database: process.env.DB_NAME || 'mes'
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Database connection failed',
        data: {
          connected: false,
          type: 'demo'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test database connection',
      message: error.message
    });
  }
});

// Reconnect to database
router.post('/reconnect', async (req, res) => {
  try {
    console.log('🔄 Attempting to reconnect to SQL Server...');
    
    // Close existing connections
    await closeConnections();
    
    // Test new connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'Successfully reconnected to SQL Server',
        data: {
          connected: true,
          type: 'sqlserver',
          server: process.env.DB_SERVER || '10.53.64.205',
          database: process.env.DB_NAME || 'mes'
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Failed to reconnect to SQL Server',
        data: {
          connected: false,
          type: 'sqlserver'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reconnect to SQL Server',
      message: error.message
    });
  }
});



export default router;
