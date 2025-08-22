import express from 'express';
import { executeQuery, executeNonQuery } from '../config/database.js';

const router = express.Router();

// Function to emit real-time updates
const emitRealtimeUpdate = (req, event, data) => {
  console.log(`🔍 emitRealtimeUpdate called with event: ${event}`);
  console.log(`🔍 Request app:`, req.app ? 'Available' : 'Not available');
  
  const io = req.app.get('io');
  console.log(`🔍 IO instance:`, io ? 'Available' : 'Not available');
  
  if (io) {
    console.log(`📡 Emitting ${event} to repair-orders room`);
    console.log(`📡 Event data:`, data);
    console.log(`📡 Connected clients:`, io.sockets.sockets.size);
    
    // Get clients in repair-orders room
    const room = io.sockets.adapter.rooms.get('repair-orders');
    const clientsInRoom = room ? Array.from(room) : [];
    console.log(`📡 Clients in repair-orders room:`, clientsInRoom);
    
    io.to('repair-orders').emit(event, data);
    console.log(`✅ Successfully emitted ${event}:`, data);
  } else {
    console.error(`❌ WebSocket not available for event: ${event}`);
  }
};

// GET /api/repair-orders - Get all repair orders with filters
router.get('/', async (req, res) => {
  try {
    const { status, dept, emprepair, priority, limit = 50, offset = 0, date, period } = req.query;
    
    let sqlQuery = `
      SELECT 
        order_no,
        subject,
        name,
        dept,
        emp,
        device_type,
        insert_date,
        status,
        items,
        rootcause,
        action,
        emprepair,
        last_date,
        notes
      FROM TBL_IT_PCMAINTENANCE
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (status && status !== 'all') {
      sqlQuery += ` AND status = ?`;
      params.push(status);
    }
    
    if (dept) {
      sqlQuery += ` AND dept = ?`;
      params.push(dept);
    }
    
    if (emprepair) {
      sqlQuery += ` AND emprepair = ?`;
      params.push(emprepair);
    }
    
    // Add date filter based on period
    if (date && period) {
      const selectedDate = new Date(date);
      
      switch (period) {
        case 'daily':
          sqlQuery += ` AND insert_date LIKE ?`;
          params.push(`${date}%`);
          break;
        case 'monthly':
          const monthYear = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
          sqlQuery += ` AND FORMAT(insert_date, 'yyyy-MM') = ?`;
          params.push(monthYear);
          console.log('📊 Monthly filter params:', monthYear);
          break;
        case 'yearly':
          sqlQuery += ` AND YEAR(insert_date) = ?`;
          params.push(selectedDate.getFullYear());
          break;
        default:
          // No filter - show all data
          break;
      }
    }
    
    // Add sorting and pagination for SQL Server
    sqlQuery += ` ORDER BY insert_date DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
    
    params.push(parseInt(offset));
    params.push(parseInt(limit));
    
    const result = await executeQuery(sqlQuery, params);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        demo: result.demo
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
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/repair-orders/:id - Get specific repair order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `
      SELECT 
        order_no,
        subject,
        name,
        dept,
        emp,
        device_type,
        insert_date,
        status,
        items,
        rootcause,
        action,
        emprepair,
        last_date,
        notes
      FROM TBL_IT_PCMAINTENANCE
      WHERE order_no = ?
    `;
    
    const result = await executeQuery(sqlQuery, [id]);
    
    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        data: result.data[0],
        demo: result.demo
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Repair order not found'
      });
    }
  } catch (error) {
    console.error('Error fetching repair order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      items = '',
      notes = ''
    } = req.body;
    
    const sqlQuery = `
      INSERT INTO TBL_IT_PCMAINTENANCE 
      (subject, name, dept, emp, device_type, items, notes, status, insert_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', DATEADD(HOUR, 7, GETUTCDATE()))
    `;
    
    const result = await executeNonQuery(sqlQuery, [
      subject,
      name,
      dept,
      emp,
      device_type,
      items,
      notes
    ]);
    
    if (result.success) {
      // Get the created order
      const getOrderQuery = `
        SELECT TOP 1 * FROM TBL_IT_PCMAINTENANCE 
        WHERE subject = ? AND name = ? AND dept = ? AND emp = ? 
        ORDER BY insert_date DESC
      `;
      
      const orderResult = await executeQuery(getOrderQuery, [subject, name, dept, emp]);
      
      if (orderResult.success && orderResult.data.length > 0) {
        const newOrder = orderResult.data[0];
        console.log(`📝 New order created:`, newOrder);
        
        // Emit real-time update
        console.log(`📡 About to emit order-created event for order:`, newOrder.order_no);
        emitRealtimeUpdate(req, 'order-created', {
          orderNo: newOrder.order_no,
          data: newOrder,
          action: 'created'
        });
        
        res.status(201).json({
          success: true,
          data: newOrder,
          demo: result.demo
        });
      } else {
        res.status(201).json({
          success: true,
          message: 'Repair order created successfully',
          demo: result.demo
        });
      }
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
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/repair-orders/:id - Update repair order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Build dynamic UPDATE query
    const updateFields = [];
    const params = [];
    
    Object.keys(updateData).forEach(key => {
      if (key !== 'order_no' && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    // Add last_date update
          updateFields.push('last_date = DATEADD(HOUR, 7, GETUTCDATE())');
    
    const sqlQuery = `
      UPDATE TBL_IT_PCMAINTENANCE 
      SET ${updateFields.join(', ')}
      WHERE order_no = ?
    `;
    
    params.push(id);
    
    const result = await executeNonQuery(sqlQuery, params);
    
    if (result.success) {
      // Get the updated order
      const getOrderQuery = `
        SELECT * FROM TBL_IT_PCMAINTENANCE WHERE order_no = ?
      `;
      
      const orderResult = await executeQuery(getOrderQuery, [id]);
      
      if (orderResult.success && orderResult.data.length > 0) {
        const updatedOrder = orderResult.data[0];
        
        // Emit real-time update
        emitRealtimeUpdate(req, 'order-updated', {
          orderNo: id,
          data: updatedOrder,
          action: 'updated'
        });
        
        res.json({
          success: true,
          data: updatedOrder,
          demo: result.demo
        });
      } else {
        res.json({
          success: true,
          message: 'Repair order updated successfully',
          demo: result.demo
        });
      }
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
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/repair-orders/:id - Delete repair order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = `DELETE FROM TBL_IT_PCMAINTENANCE WHERE order_no = ?`;
    const result = await executeNonQuery(sqlQuery, [id]);
    
    if (result.success) {
      // Emit real-time update
      emitRealtimeUpdate(req, 'order-deleted', {
        orderNo: id,
        action: 'deleted'
      });
      
      res.json({
        success: true,
        message: 'Repair order deleted successfully',
        demo: result.demo
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
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/repair-orders/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { date, period } = req.query;
    
    // Build date filter based on period
    let dateFilter = '';
    let dateParams = [];
    
    if (date && period) {
      const selectedDate = new Date(date);
      
      switch (period) {
        case 'daily':
          dateFilter = `AND insert_date LIKE ?`;
          dateParams.push(`${date}%`);
          break;
        case 'monthly':
          const monthYear = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
          dateFilter = `AND FORMAT(insert_date, 'yyyy-MM') = ?`;
          dateParams.push(monthYear);
          console.log('📊 Monthly filter params:', monthYear);
          break;
        case 'yearly':
          dateFilter = `AND YEAR(insert_date) = ?`;
          dateParams.push(selectedDate.getFullYear());
          break;
        default:
          // No filter - show all data
          break;
      }
    }
    
    console.log('📊 Dashboard stats filter:', { date, period, dateFilter, dateParams });
    
    // Get total count with date filter
    const totalQuery = `SELECT COUNT(*) as total FROM TBL_IT_PCMAINTENANCE WHERE 1=1 ${dateFilter}`;
    const totalResult = await executeQuery(totalQuery, dateParams);
    const total = totalResult.success ? totalResult.data[0].total : 0;
    
    // Get status counts with date filter
    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM TBL_IT_PCMAINTENANCE 
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `;
    const statusResult = await executeQuery(statusQuery, dateParams);
    
    const statusCounts = {};
    if (statusResult.success) {
      statusResult.data.forEach(row => {
        statusCounts[row.status] = row.count;
      });
    }
    
    // Get department counts with date filter
    const deptQuery = `
      SELECT TOP 10 dept, COUNT(*) as count 
      FROM TBL_IT_PCMAINTENANCE 
      WHERE 1=1 ${dateFilter}
      GROUP BY dept 
      ORDER BY count DESC
    `;
    const deptResult = await executeQuery(deptQuery, dateParams);
    
    // Get device type counts with date filter
    const deviceQuery = `
      SELECT TOP 5 device_type, COUNT(*) as count 
      FROM TBL_IT_PCMAINTENANCE 
      WHERE 1=1 ${dateFilter}
      GROUP BY device_type 
      ORDER BY count DESC
    `;
    const deviceResult = await executeQuery(deviceQuery, dateParams);
    
    // Get dynamic trends based on period
    let trendsQuery = '';
    let trendsLabel = '';
    
    switch (period) {
      case 'daily':
        // Show hourly trends for the selected day with time range
        trendsQuery = `
          SELECT 
            FORMAT(insert_date, 'HH:00') + '-00' as hour,
            COUNT(*) as count
          FROM TBL_IT_PCMAINTENANCE 
          WHERE insert_date LIKE ?
          GROUP BY FORMAT(insert_date, 'HH:00')
          ORDER BY hour ASC
        `;
        trendsLabel = 'hour';
        break;
      case 'monthly':
        // Show daily trends for the selected month with full date
        trendsQuery = `
          SELECT 
            FORMAT(insert_date, 'dd MMMM yyyy') as day,
            COUNT(*) as count
          FROM TBL_IT_PCMAINTENANCE 
          WHERE FORMAT(insert_date, 'yyyy-MM') = ?
          GROUP BY FORMAT(insert_date, 'dd MMMM yyyy')
          ORDER BY MIN(insert_date) ASC
        `;
        trendsLabel = 'day';
        break;
      case 'yearly':
        // Show monthly trends for the selected year with month name
        trendsQuery = `
          SELECT 
            FORMAT(insert_date, 'MMMM yyyy') as month,
            COUNT(*) as count
          FROM TBL_IT_PCMAINTENANCE 
          WHERE YEAR(insert_date) = ?
          GROUP BY FORMAT(insert_date, 'MMMM yyyy')
          ORDER BY MIN(insert_date) ASC
        `;
        trendsLabel = 'month';
        break;
      default:
        // Default: monthly trends (last 12 months)
        trendsQuery = `
          SELECT 
            FORMAT(insert_date, 'MMMM yyyy') as month,
            COUNT(*) as count
          FROM TBL_IT_PCMAINTENANCE 
          WHERE insert_date >= DATEADD(month, -12, DATEADD(HOUR, 7, GETUTCDATE()))
          GROUP BY FORMAT(insert_date, 'MMMM yyyy')
          ORDER BY MIN(insert_date) DESC
        `;
        trendsLabel = 'month';
        break;
    }
    
    const trendsResult = await executeQuery(trendsQuery, period ? dateParams : []);
    
    // Get recent orders with date filter
    const recentQuery = `
      SELECT TOP 5 * FROM TBL_IT_PCMAINTENANCE 
      WHERE 1=1 ${dateFilter}
      ORDER BY insert_date DESC
    `;
    const recentResult = await executeQuery(recentQuery, dateParams);
    
    const stats = {
      total,
      pending: statusCounts.pending || 0,
      inProgress: statusCounts['in-progress'] || 0,
      completed: statusCounts.completed || 0,
      cancelled: statusCounts.cancelled || 0,
      byDepartment: deptResult.success ? deptResult.data : [],
      byDeviceType: deviceResult.success ? deviceResult.data : [],
      monthlyTrends: trendsResult.success ? trendsResult.data : [],
      trendsLabel: trendsLabel,
      recentOrders: recentResult.success ? recentResult.data : []
    };
    
    res.json({
      success: true,
      data: stats,
      demo: totalResult.demo
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
