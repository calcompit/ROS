import express from 'express';
import { executeQuery, getPool } from '../config/database.js';

const router = express.Router();

// Sample data for demo mode
const sampleData = [
  {
    order_no: 'RO-2024-001',
    subject: 'Laptop screen flickering during graphics applications',
    name: 'PC-IT-001',
    dept: 'IT Department',
    emp: 'John Doe',
    insert_date: '2024-01-15T10:30:00Z',
    items: 'Dell Latitude 5520, Intel Graphics, 16GB RAM, Windows 11 Pro',
    rootcause: 'Graphics driver compatibility issue with updated Windows display drivers',
    emprepair: 'Smith Wilson',
    last_date: '2024-01-16T14:20:00Z',
    status: 'in-progress'
  },
  {
    order_no: 'RO-2024-002',
    subject: 'Network printer not responding to print jobs',
    name: 'PRINTER-ACC-02',
    dept: 'Accounting',
    emp: 'Jane Smith',
    insert_date: '2024-01-14T09:15:00Z',
    items: 'HP LaserJet Pro 4050dn, Network Connection, Ethernet',
    rootcause: '',
    emprepair: '',
    last_date: '2024-01-14T09:15:00Z',
    status: 'pending'
  },
  {
    order_no: 'RO-2024-003',
    subject: 'Desktop computer fails to boot - black screen',
    name: 'PC-HR-015',
    dept: 'Human Resources',
    emp: 'Mike Johnson',
    insert_date: '2024-01-10T11:45:00Z',
    items: 'Dell OptiPlex 7090, 32GB RAM, 1TB SSD, Intel Core i7',
    rootcause: 'Failed RAM module causing boot failure, PSU voltage instability',
    emprepair: 'Sarah Chen',
    last_date: '2024-01-13T15:30:00Z',
    status: 'completed'
  }
];

// Check if database is available
const isDatabaseAvailable = () => {
  return getPool() !== null && getPool() !== undefined;
};

// Generate new order number
const generateOrderNo = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `RO-${year}-${timestamp}`;
};

// GET /api/repair-orders - Get all repair orders with filters
router.get('/', async (req, res) => {
  try {
    const { status, dept, emprepair, priority, limit = 50, offset = 0 } = req.query;
    
    // Check if database is available
    if (!isDatabaseAvailable()) {
      // Demo mode - use sample data
      let filteredData = [...sampleData];
      
      // Apply filters
      if (status) {
        filteredData = filteredData.filter(item => item.status === status);
      }
      if (dept) {
        filteredData = filteredData.filter(item => item.dept === dept);
      }
      if (emprepair) {
        filteredData = filteredData.filter(item => item.emprepair === emprepair);
      }
      
      // Sort by insert_date DESC
      filteredData.sort((a, b) => new Date(b.insert_date) - new Date(a.insert_date));
      
      // Apply pagination
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return res.json({
        success: true,
        data: paginatedData,
        total: paginatedData.length,
        demo: true
      });
    }

    // Database mode
    let query = 'SELECT * FROM dbo.TBL_IT_PCMAINTENANCE WHERE 1=1';
    const params = {};

    // Add filters
    if (status) {
      query += ' AND status = @status';
      params.status = status;
    }
    if (dept) {
      query += ' AND dept = @dept';
      params.dept = dept;
    }
    if (emprepair) {
      query += ' AND emprepair = @emprepair';
      params.emprepair = emprepair;
    }

    // Add ordering and pagination
    query += ' ORDER BY insert_date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    params.offset = parseInt(offset);
    params.limit = parseInt(limit);

    const result = await executeQuery(query, params);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        total: result.data.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch repair orders',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching repair orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/repair-orders/:orderNo - Get specific repair order
router.get('/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    
    const query = 'SELECT * FROM dbo.TBL_IT_PCMAINTENANCE WHERE order_no = @orderNo';
    const result = await executeQuery(query, { orderNo });

    if (result.success) {
      if (result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }
      
      res.json({
        success: true,
        data: result.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch repair order',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching repair order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/repair-orders - Create new repair order
router.post('/', async (req, res) => {
  try {
    const {
      subject,
      name,
      dept,
      emp,
      items,
      rootcause,
      emprepair
    } = req.body;

    // Validation
    if (!subject || !name || !dept || !emp) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: subject, name, dept, emp'
      });
    }

    if (!getPool()) {
      // Demo mode - create sample order
      const order_no = generateOrderNo();
      const now = new Date().toISOString();
      const newOrder = {
        order_no,
        subject,
        name,
        dept,
        emp,
        items: items || '',
        rootcause: rootcause || '',
        action: '',
        emprepair: emprepair || '',
        last_date: now,
        status: 'pending',
        insert_date: now
      };
      
      // Add to sample data
      sampleData.unshift(newOrder);
      
      return res.status(201).json({
        success: true,
        message: 'Repair order created successfully (demo mode)',
        data: newOrder,
        demo: true
      });
    }

    const query = `
      INSERT INTO dbo.TBL_IT_PCMAINTENANCE 
      (subject, name, dept, emp, items, rootcause, emprepair, status, insert_date)
      VALUES (@subject, @name, @dept, @emp, @items, @rootcause, @emprepair, 'pending', @insert_date)
    `;
    
    const params = { 
      subject, 
      name, 
      dept, 
      emp, 
      items: items || '', 
      rootcause: rootcause || '', 
      emprepair: emprepair || '',
      insert_date: insert_date || new Date().toISOString()
    };
    const result = await executeQuery(query, params);

    if (result.success) {
      // Get the last inserted order
      const fetchQuery = 'SELECT TOP 1 * FROM dbo.TBL_IT_PCMAINTENANCE WHERE subject = @subject AND name = @name ORDER BY order_no DESC';
      const fetchResult = await executeQuery(fetchQuery, { subject, name });
      
      res.status(201).json({
        success: true,
        message: 'Repair order created successfully',
        data: fetchResult.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create repair order',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating repair order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/repair-orders/:orderNo - Update repair order
router.put('/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    // Convert orderNo to integer for database query
    const orderNoInt = parseInt(orderNo);
    const updateFields = req.body;

    // Remove fields that shouldn't be updated
    delete updateFields.order_no;
    delete updateFields.insert_date;
    delete updateFields.created_at;

    const allowedFields = [
      'subject', 'rootcause', 'action', 'emprepair', 'status', 
      'items', 'notes'
    ];

    if (!getPool()) {
      // Demo mode - update sample data
      const orderIndex = sampleData.findIndex(order => order.order_no.toString() === orderNo.toString());
      
      if (orderIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      // Update allowed fields
      Object.keys(updateFields).forEach(key => {
        if (allowedFields.includes(key) && updateFields[key] !== undefined) {
          sampleData[orderIndex][key] = updateFields[key];
        }
      });

      // Always update last_date
      sampleData[orderIndex].last_date = new Date().toISOString();

      return res.json({
        success: true,
        message: 'Repair order updated successfully (demo mode)',
        data: sampleData[orderIndex],
        demo: true
      });
    }

    const updates = [];
    const params = { orderNo: orderNoInt };

    Object.keys(updateFields).forEach(key => {
      if (allowedFields.includes(key) && updateFields[key] !== undefined) {
        updates.push(`${key} = @${key}`);
        params[key] = updateFields[key];
      }
    });

    // Always update last_date
    updates.push('last_date = GETDATE()');

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const query = `UPDATE dbo.TBL_IT_PCMAINTENANCE SET ${updates.join(', ')} WHERE order_no = @orderNo`;
    const result = await executeQuery(query, params);

    if (result.success) {
      // Fetch updated order
      const fetchQuery = 'SELECT * FROM dbo.TBL_IT_PCMAINTENANCE WHERE order_no = @orderNo';
      const fetchResult = await executeQuery(fetchQuery, { orderNo: orderNoInt });
      
      if (fetchResult.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      res.json({
        success: true,
        message: 'Repair order updated successfully',
        data: fetchResult.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update repair order',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating repair order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/repair-orders/:orderNo - Delete repair order
router.delete('/:orderNo', async (req, res) => {
  try {
    const { orderNo } = req.params;
    // Convert orderNo to integer for database query
    const orderNoInt = parseInt(orderNo);
    
    const query = 'DELETE FROM dbo.TBL_IT_PCMAINTENANCE WHERE order_no = @orderNo';
    const result = await executeQuery(query, { orderNo: orderNoInt });

    if (result.success) {
      if (result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      res.json({
        success: true,
        message: 'Repair order deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete repair order',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting repair order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/repair-orders/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE',
      pending: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'pending\'',
      inProgress: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'in-progress\'',
      completed: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'Success\'',
      byDepartment: 'SELECT dept, COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE GROUP BY dept',
      recentOrders: 'SELECT TOP 10 * FROM dbo.TBL_IT_PCMAINTENANCE ORDER BY insert_date DESC'
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      if (result.success) {
        results[key] = result.data;
      } else {
        console.error(`Error executing ${key} query:`, result.error);
        results[key] = [];
      }
    }

    res.json({
      success: true,
      data: {
        total: results.total[0]?.count || 0,
        pending: results.pending[0]?.count || 0,
        inProgress: results.inProgress[0]?.count || 0,
        completed: results.completed[0]?.count || 0,
        byDepartment: results.byDepartment,
        recentOrders: results.recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

export default router;
