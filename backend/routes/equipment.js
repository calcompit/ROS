import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// GET /api/equipment - Get all equipment
router.get('/', async (req, res) => {
  try {
    const sqlQuery = 'SELECT items as equipment FROM TBL_IT_PCEQUIPMENT ORDER BY items';
    const result = await executeQuery(sqlQuery);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        demo: result.demo
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
