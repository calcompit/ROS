import express from 'express';
import { executeQuery, getPool } from '../config/database.js';

const router = express.Router();

// Function to emit real-time updates
const emitRealtimeUpdate = (req, event, data) => {
  const io = req.app.get('io');
  if (io) {
    console.log(`📡 Emitting ${event} to repair-orders room`);
    console.log(`📡 Event data:`, data);
    console.log(`📡 Connected clients:`, io.sockets.sockets.size);
    io.to('repair-orders').emit(event, data);
    console.log(`✅ Successfully emitted ${event}:`, data);
  } else {
    console.error(`❌ WebSocket not available for event: ${event}`);
  }
};

// Sample data for demo mode
const sampleData = [
  {
    order_no: 'RO-2024-001',
    subject: 'Laptop screen flickering during graphics applications',
    name: 'PC-IT-001',
    dept: 'IT Department',
    emp: 'John Doe',
    device_type: 'Laptop',
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
    device_type: 'Printer',
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
    device_type: 'Desktop',
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
      device_type,
      items,
      rootcause,
      emprepair,
      insert_date
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
        device_type: device_type || '',
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
      
      // Emit real-time update
      emitRealtimeUpdate(req, 'order-created', {
        data: newOrder,
        action: 'created'
      });
      
      return res.status(201).json({
        success: true,
        message: 'Repair order created successfully (demo mode)',
        data: newOrder,
        demo: true
      });
    }

    const query = `
      INSERT INTO dbo.TBL_IT_PCMAINTENANCE 
      (subject, name, dept, emp, device_type, items, rootcause, emprepair, status, insert_date)
      VALUES (@subject, @name, @dept, @emp, @device_type, @items, @rootcause, @emprepair, 'pending', @insert_date)
    `;
    
    const params = { 
      subject, 
      name, 
      dept, 
      emp, 
      device_type: device_type || '', 
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
      
      // Emit real-time update
      emitRealtimeUpdate(req, 'order-created', {
        data: fetchResult.data[0],
        action: 'created'
      });

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
      'items', 'notes', 'device_type'
    ];

    if (!getPool()) {
      // Demo mode - update sample data
      console.log('🔄 Demo mode: Updating order', orderNo);
      console.log('🔄 Update fields:', updateFields);
      
      const orderIndex = sampleData.findIndex(order => order.order_no.toString() === orderNo.toString());
      
      if (orderIndex === -1) {
        console.log('❌ Order not found in sample data:', orderNo);
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      console.log('✅ Found order at index:', orderIndex);
      console.log('📝 Original order data:', sampleData[orderIndex]);

      // Update allowed fields
      Object.keys(updateFields).forEach(key => {
        if (allowedFields.includes(key) && updateFields[key] !== undefined) {
          console.log(`🔄 Updating field ${key}: ${sampleData[orderIndex][key]} -> ${updateFields[key]}`);
          sampleData[orderIndex][key] = updateFields[key];
        }
      });

      // Always update last_date
      sampleData[orderIndex].last_date = new Date().toISOString();
      console.log('🔄 Updated last_date to:', sampleData[orderIndex].last_date);

      console.log('📝 Updated order data:', sampleData[orderIndex]);

      // Emit real-time update
      emitRealtimeUpdate(req, 'order-updated', {
        orderNo: orderNo,
        data: sampleData[orderIndex],
        action: 'updated'
      });

      return res.json({
        success: true,
        message: 'Repair order updated successfully (demo mode)',
        data: sampleData[orderIndex],
        demo: true
      });
    }

    const updates = [];
    const params = { orderNo: orderNoInt };

    console.log('🔄 Database mode: Updating order', orderNo);
    console.log('🔄 Update fields:', updateFields);

    Object.keys(updateFields).forEach(key => {
      if (allowedFields.includes(key) && updateFields[key] !== undefined) {
        updates.push(`${key} = @${key}`);
        params[key] = updateFields[key];
        console.log(`🔄 Adding field ${key} = ${updateFields[key]}`);
      }
    });

    // Always update last_date
    updates.push('last_date = GETDATE()');
    console.log('🔄 Adding last_date update');

    if (updates.length === 0) {
      console.log('❌ No valid fields to update');
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const query = `UPDATE dbo.TBL_IT_PCMAINTENANCE SET ${updates.join(', ')} WHERE order_no = @orderNo`;
    console.log('🔄 SQL Query:', query);
    console.log('🔄 Parameters:', params);
    
    const result = await executeQuery(query, params);

    if (result.success) {
      console.log('✅ Database update successful');
      
      // Fetch updated order
      const fetchQuery = 'SELECT * FROM dbo.TBL_IT_PCMAINTENANCE WHERE order_no = @orderNo';
      const fetchResult = await executeQuery(fetchQuery, { orderNo: orderNoInt });
      
      if (fetchResult.data.length === 0) {
        console.log('❌ Updated order not found in database');
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      console.log('📝 Updated order data:', fetchResult.data[0]);

      // Emit real-time update
      emitRealtimeUpdate(req, 'order-updated', {
        orderNo: orderNo,
        data: fetchResult.data[0],
        action: 'updated'
      });

      res.json({
        success: true,
        message: 'Repair order updated successfully',
        data: fetchResult.data[0]
      });
    } else {
      console.error('❌ Database update failed:', result.error);
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
    
    if (!getPool()) {
      // Demo mode - remove from sample data
      const orderIndex = sampleData.findIndex(order => order.order_no.toString() === orderNo.toString());
      
      if (orderIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      // Remove from sample data
      sampleData.splice(orderIndex, 1);

      // Emit real-time update
      emitRealtimeUpdate(req, 'order-deleted', {
        orderNo: orderNo,
        action: 'deleted'
      });

      return res.json({
        success: true,
        message: 'Repair order deleted successfully (demo mode)',
        demo: true
      });
    }
    
    const query = 'DELETE FROM dbo.TBL_IT_PCMAINTENANCE WHERE order_no = @orderNo';
    const result = await executeQuery(query, { orderNo: orderNoInt });

    if (result.success) {
      if (result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Repair order not found'
        });
      }

      // Emit real-time update
      emitRealtimeUpdate(req, 'order-deleted', {
        orderNo: orderNo,
        action: 'deleted'
      });

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
    // Check if database is available
    if (!isDatabaseAvailable()) {
      // Demo mode - calculate stats from sample data
      const total = sampleData.length;
      const pending = sampleData.filter(item => item.status === 'pending').length;
      const inProgress = sampleData.filter(item => item.status === 'in-progress').length;
      const completed = sampleData.filter(item => item.status === 'completed').length;
      const cancelled = sampleData.filter(item => item.status === 'cancelled').length;
      
      // Department stats
      const deptStats = {};
      sampleData.forEach(item => {
        deptStats[item.dept] = (deptStats[item.dept] || 0) + 1;
      });
      const byDepartment = Object.entries(deptStats).map(([dept, count]) => ({ dept, count }));
      
      // Monthly trends (last 6 months)
      const monthlyData = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const count = sampleData.filter(item => {
          const itemDate = new Date(item.insert_date);
          return itemDate >= monthStart && itemDate <= monthEnd;
        }).length;
        
        monthlyData.push({ label: monthName, value: count });
      }
      
      // Device type stats
      const deviceStats = {};
      sampleData.forEach(item => {
        const deviceType = item.device_type || 'Unknown';
        deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
      });
      const byDeviceType = Object.entries(deviceStats).map(([device, count]) => ({ device, count }));

      return res.json({
        success: true,
        data: {
          total,
          pending,
          inProgress,
          completed,
          cancelled,
          byDepartment,
          byDeviceType,
          monthlyTrends: monthlyData,
          recentOrders: sampleData.slice(0, 10)
        },
        demo: true
      });
    }

    // Real database queries
    const queries = {
      total: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE',
      pending: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'pending\'',
      inProgress: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'in-progress\'',
      completed: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'completed\'',
      cancelled: 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE status = \'cancelled\'',
      byDepartment: 'SELECT dept, COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE GROUP BY dept ORDER BY count DESC',
      byDeviceType: 'SELECT device_type, COUNT(*) as count FROM dbo.TBL_IT_PCMAINTENANCE WHERE device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC',
      monthlyTrends: `
        SELECT 
          FORMAT(insert_date, 'MMM') as month,
          COUNT(*) as count
        FROM dbo.TBL_IT_PCMAINTENANCE 
        WHERE insert_date >= DATEADD(month, -5, GETDATE())
        GROUP BY FORMAT(insert_date, 'MMM'), MONTH(insert_date)
        ORDER BY MONTH(insert_date)
      `,
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
        cancelled: results.cancelled[0]?.count || 0,
        byDepartment: results.byDepartment,
        byDeviceType: results.byDeviceType,
        monthlyTrends: results.monthlyTrends,
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
