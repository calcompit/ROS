import express from 'express';
import { executeQuery, getPool } from '../config/database.js';

const router = express.Router();

// Get all subjects from TBL_IT_PCSUBJECT
router.get('/', async (req, res) => {
  try {
    if (!getPool()) {
      // Demo mode - return sample subjects
      const sampleSubjects = [
        { subject: 'Install Windows 11' },
        { subject: 'Install Windows 10' },
        { subject: 'Microsoft Office Installation' },
        { subject: 'Hardware Repair' },
        { subject: 'Network Connection Issue' },
        { subject: 'Software Update' },
        { subject: 'Printer Configuration' },
        { subject: 'Email Setup' }
      ];
      return res.json({ success: true, data: sampleSubjects, demo: true });
    }

    // First check if table has data
    const checkQuery = 'SELECT COUNT(*) as count FROM dbo.TBL_IT_PCSUBJECT';
    console.log('🔍 Checking subjects table...');
    let count = 0;
    try {
      const checkResult = await executeQuery(checkQuery);
      console.log('📊 Check result:', checkResult);
      count = checkResult?.recordset?.[0]?.count || 0;
      console.log('📈 Subjects count:', count);
    } catch (error) {
      console.log('❌ Table TBL_IT_PCSUBJECT not found or error:', error.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch subjects',
        error: error.message 
      });
    }

    // Table has data, fetch from database
    console.log('📝 Table has data, fetching from database...');

    const query = 'SELECT subject FROM dbo.TBL_IT_PCSUBJECT ORDER BY subject';
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
        message: 'Failed to fetch subjects',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subjects',
      error: error.message 
    });
  }
});

export default router;
