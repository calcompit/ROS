import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', async (req, res) => {
  try {
    const sqlQuery = 'SELECT dept FROM TBL_IT_PCDEPT ORDER BY dept';
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
        message: 'Failed to fetch departments',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
