import express from 'express';
import { executeQuery } from '../config/database.js';

const router = express.Router();

// GET /api/subjects - Get all subjects
router.get('/', async (req, res) => {
  try {
    const sqlQuery = 'SELECT subject FROM TBL_IT_PCSUBJECT ORDER BY subject';
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
        message: 'Failed to fetch subjects',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
