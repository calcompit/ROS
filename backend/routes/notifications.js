import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// GET /api/notifications - Get notifications for user
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT n.*, ro.subject as order_subject 
      FROM notifications n
      LEFT JOIN repair_orders ro ON n.order_no = ro.order_no
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND (n.user_id = ? OR n.user_id IS NULL)';
      params.push(userId);
    }

    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await executeQuery(query, params);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/notifications - Create new notification
router.post('/', async (req, res) => {
  try {
    const { userId, orderNo, title, message, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const query = `
      INSERT INTO notifications (user_id, order_no, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [userId || null, orderNo || null, title, message, type];
    const result = await executeQuery(query, params);

    if (result.success) {
      // Fetch the created notification
      const fetchQuery = 'SELECT * FROM notifications WHERE id = ?';
      const fetchResult = await executeQuery(fetchQuery, [result.data.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: fetchResult.data[0]
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    const result = await executeQuery(query, [id]);

    if (result.success) {
      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM notifications WHERE id = ?';
    const result = await executeQuery(query, [id]);

    if (result.success) {
      if (result.data.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read for user
router.put('/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    
    let query = 'UPDATE notifications SET is_read = TRUE WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    if (result.success) {
      res.json({
        success: true,
        message: 'All notifications marked as read',
        updatedCount: result.data.affectedRows
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
