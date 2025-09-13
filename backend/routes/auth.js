import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Check against database TBL_IT_MAINTAINUSER
    let user = null;
    
    try {
      const query = 'SELECT username, password FROM dbo.TBL_IT_MAINTAINUSER WHERE username = @username';
      const result = await executeQuery(query, { username: username.toLowerCase() });
      
      
      if (result.data && result.data.length > 0) {
        const dbUser = result.data[0];
        // Check password with bcrypt hash
        const isValidPassword = await bcrypt.compare(password, dbUser.password);
        if (isValidPassword) {
          user = {
            id: 1,
            username: dbUser.username,
            role: 'admin',
            full_name: dbUser.username,
            department: 'IT Department'
          };
        }
      } else {
        // No user found in database, use fallback mode
        console.log('No user found in database, using fallback mode');
        const demoPasswordHash = '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2';
        const isValidDemoPassword = await bcrypt.compare(password, demoPasswordHash);
        if (username === 'admin' && isValidDemoPassword) {
          user = {
            id: 1,
            username: 'admin',
            role: 'admin',
            full_name: 'System Administrator',
            department: 'IT Department'
          };
        }
      }
    } catch (dbError) {
      console.error('Database login error:', dbError);
      // Fallback to demo mode with hashed password
      // Pre-computed hash for 'admin123' - in production, store this in database
      const demoPasswordHash = '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2';
      const isValidDemoPassword = await bcrypt.compare(password, demoPasswordHash);
      if (username === 'admin' && isValidDemoPassword) {
        user = {
          id: 1,
          username: 'admin',
          role: 'admin',
          full_name: 'System Administrator',
          department: 'IT Department'
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          department: user.department
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/test-login - Test login with specific user (development only)
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const query = 'SELECT username, password FROM dbo.TBL_IT_MAINTAINUSER WHERE username = @username';
    const result = await executeQuery(query, { username: username.toLowerCase() });
    
    console.log('Test login query result:', result);
    console.log('Username searched:', username.toLowerCase());
    
    if (result.recordset && result.recordset.length > 0) {
      const dbUser = result.recordset[0];
      console.log('Found user:', dbUser);
      
      const isValidPassword = await bcrypt.compare(password, dbUser.password);
      console.log('Password valid:', isValidPassword);
      
      res.json({
        success: true,
        message: 'Login test completed',
        data: {
          userFound: true,
          passwordValid: isValidPassword,
          user: dbUser
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Login test completed',
        data: {
          userFound: false,
          passwordValid: false,
          queryResult: result
        }
      });
    }
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test login',
      error: error.message
    });
  }
});

// GET /api/auth/users - Get all users (development only)
router.get('/users', async (req, res) => {
  try {
    const result = await executeQuery('SELECT username, full_name, role FROM dbo.TBL_IT_MAINTAINUSER');
    console.log('Users query result:', result);
    console.log('Result recordset:', result.recordset);
    console.log('Result data:', result.data);
    res.json({
      success: true,
      data: result.recordset || result.data || []
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// POST /api/auth/setup-users - Setup multiple users (development only)
router.post('/setup-users', async (req, res) => {
  try {
    const createTableSQL = `
      CREATE TABLE dbo.TBL_IT_MAINTAINUSER (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100) NULL,
        role NVARCHAR(20) DEFAULT 'admin',
        department NVARCHAR(100) DEFAULT 'IT Department',
        is_active BIT DEFAULT 1,
        created_date DATETIME DEFAULT GETDATE(),
        updated_date DATETIME DEFAULT GETDATE()
      );
    `;
    
    await executeQuery(createTableSQL);
    
    // Insert multiple users
    const users = [
      {
        username: 'admin',
        password: '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2', // admin123
        full_name: 'System Administrator',
        role: 'admin',
        department: 'IT Department'
      },
      {
        username: 'C270188',
        password: '$2a$10$/FnO25xk/wLePo/DflLzj.SH7xOmuqFWz1MTSQM3Wj.p/S1xALl7.', // C270188
        full_name: 'C270188',
        role: 'user',
        department: 'IT Department'
      },
      {
        username: 'C170616',
        password: '$2a$10$c8fYe4vxxRDT8p604dQ5oOPUVsH241rtdYVUqy.JW1L3G6UcrxJmS', // C170616
        full_name: 'C170616',
        role: 'user',
        department: 'IT Department'
      },
      {
        username: 'B770328',
        password: '$2a$10$BV5KEpgD0fAv.GLvp8M29.f7jBaJq73IRZOqSOJS7fKc9ki.z5iza', // B770328
        full_name: 'B770328',
        role: 'user',
        department: 'IT Department'
      },
      {
        username: 'B875929',
        password: '$2a$10$vWObrT4fun6lzj4hq3u9G..dYKR2WDjCIJ6kPRb844LuFzUx82ccG', // B875929
        full_name: 'B875929',
        role: 'user',
        department: 'IT Department'
      },
      {
        username: 'B476016',
        password: '$2a$10$4AF2WqRUfTDEw0o7lVYjEesIgVeQw9MW5bpd3MM1uZb7PXzxsi.l.', // B476016
        full_name: 'B476016',
        role: 'user',
        department: 'IT Department'
      }
    ];
    
    for (const user of users) {
      const insertUserSQL = `
        INSERT INTO dbo.TBL_IT_MAINTAINUSER (username, password, full_name, role, department) 
        VALUES ('${user.username}', '${user.password}', '${user.full_name}', '${user.role}', '${user.department}');
      `;
      await executeQuery(insertUserSQL);
    }
    
    res.json({
      success: true,
      message: 'Users created successfully',
      users: users.map(u => ({ username: u.username, full_name: u.full_name, role: u.role }))
    });
  } catch (error) {
    console.error('Setup users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup users',
      error: error.message
    });
  }
});

// POST /api/auth/setup-admin - Setup admin user (development only)
router.post('/setup-admin', async (req, res) => {
  try {
    const createTableSQL = `
      CREATE TABLE dbo.TBL_IT_MAINTAINUSER (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100) NULL,
        role NVARCHAR(20) DEFAULT 'admin',
        department NVARCHAR(100) DEFAULT 'IT Department',
        is_active BIT DEFAULT 1,
        created_date DATETIME DEFAULT GETDATE(),
        updated_date DATETIME DEFAULT GETDATE()
      );
    `;
    
    await executeQuery(createTableSQL);
    
    const insertUserSQL = `
      INSERT INTO dbo.TBL_IT_MAINTAINUSER (username, password, full_name, role, department) 
      VALUES ('admin', '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2', 'System Administrator', 'admin', 'IT Department');
    `;
    
    await executeQuery(insertUserSQL);
    
    res.json({
      success: true,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup admin user'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/verify - Verify JWT token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    res.json({
      success: true,
      data: {
        user: decoded
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Middleware to verify authentication
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to check admin role
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

export default router;
