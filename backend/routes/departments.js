import express from 'express';
import { executeQuery, getPool } from '../config/database.js';
import sql from 'mssql';

const router = express.Router();

// Get all departments from TBL_IT_PCDEPT
router.get('/', async (req, res) => {
  try {
    console.log('🔍 getPool():', getPool());
    // Force demo mode for testing
    if (true) {
      console.log('🔍 Using demo mode');
      // Demo mode - return sample departments
      const sampleDepartments = [
        { dept: 'AUDIT' },
        { dept: 'EQ' },
        { dept: 'FG' },
        { dept: 'FPM' },
        { dept: 'IT' },
        { dept: 'MFG' },
        { dept: 'OBA' },
        { dept: 'PE' },
        { dept: 'PP' },
        { dept: 'QA' },
        { dept: 'QC' },
        { dept: 'ROBOT' },
        { dept: 'SCQA' },
        { dept: 'SMT' },
        { dept: 'TEST' },
        { dept: 'WH' }
      ];
      console.log('📊 Returning demo data:', sampleDepartments);
      return res.json({ success: true, data: sampleDepartments, demo: true });
    }

    // First check if table has data
    const checkQuery = 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCDEPT';
    let count = 0;
    try {
      const checkResult = await executeQuery(checkQuery);
      count = checkResult?.data?.[0]?.count || 0;
    } catch (error) {
      console.log('❌ Table TBL_IT_PCDEPT not found or error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch departments',
        error: error.message 
      });
    }

    // Table has data, fetch from database
    console.log('📝 Table has data, fetching from database...');

    const query = 'SELECT dept FROM dbo.TBL_IT_PCDEPT ORDER BY dept';
    console.log('🔍 Executing SELECT query:', query);
    try {
      const pool = getPool();
      const request = pool.request();
      const result = await request.query(query);
      console.log('📊 SELECT result:', result);
      console.log('📊 Result.recordset:', result.recordset);
      console.log('📈 Data length:', result.recordset?.length);
      console.log('📋 Data:', result.recordset);
      
      res.json({ 
        success: true, 
        data: result.recordset || [],
        total: result.recordset?.length || 0
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
