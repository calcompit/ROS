import express from 'express';
import { executeQuery, getPool } from '../config/database.js';

const router = express.Router();

// Get all departments from TBL_IP_DEPT
router.get('/', async (req, res) => {
  try {
    if (!getPool()) {
      // Demo mode - return sample departments
      const sampleDepartments = [
        { DEPT_NAME: 'IT Department' },
        { DEPT_NAME: 'Accounting' },
        { DEPT_NAME: 'Human Resources' },
        { DEPT_NAME: 'Sales' },
        { DEPT_NAME: 'Marketing' },
        { DEPT_NAME: 'Engineering' },
        { DEPT_NAME: 'Customer Service' },
        { DEPT_NAME: 'Operations' }
      ];
      return res.json({ success: true, data: sampleDepartments, demo: true });
    }

    // First check if table has data
    const checkQuery = 'SELECT COUNT(*) as count FROM dbo.TBL_IP_DEPT';
    let count = 0;
    try {
      const checkResult = await executeQuery(checkQuery);
      count = checkResult?.recordset?.[0]?.count || 0;
    } catch (error) {
      console.log('❌ Table TBL_IP_DEPT not found or error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error.message 
      });
    }

    // Table has data, fetch from database
    console.log('📝 Table has data, fetching from database...');

    const query = 'SELECT DEPT_NAME FROM dbo.TBL_IP_DEPT ORDER BY DEPT_NAME';
    console.log('🔍 Executing SELECT query:', query);
    try {
      const result = await executeQuery(query);
      console.log('📊 SELECT result:', result);
      console.log('📈 Data length:', result?.data?.length);
      console.log('📋 Data:', result?.data);
      
      res.json({ 
        success: true, 
        data: result.data || [],
        total: result.data?.length || 0
      });
    } catch (error) {
      console.log('❌ SELECT query error:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch departments',
      error: error.message 
    });
  }
});

export default router;
