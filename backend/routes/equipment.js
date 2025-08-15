import express from 'express';
import { executeQuery, getPool } from '../config/database.js';

const router = express.Router();

// Sample data for demo mode (fallback)
const sampleEquipment = [
  'RAM',
  'POWERSUPPLY', 
  'HDD',
  'SSD',
  'MOTHERBOARD',
  'CPU',
  'GPU',
  'NETWORK',
  'KEYBOARD',
  'MOUSE'
];

// Check if database is available
const isDatabaseAvailable = () => {
  try {
    const pool = getPool();
    return pool !== null && pool !== undefined;
  } catch (error) {
    console.error('Database availability check error:', error);
    return false;
  }
};

// GET /api/equipment - Get all equipment
router.get('/', async (req, res) => {
  try {
    // Always try database first, fallback to demo if needed
    console.log('🔍 Attempting to fetch equipment from database...');

    // Database mode - get items from TBL_IT_PCEQUIPMENT table
    const query = 'SELECT items FROM dbo.TBL_IT_PCEQUIPMENT WHERE items IS NOT NULL AND items != \'\' ORDER BY items';
    const result = await executeQuery(query);

    if (result.success && result.data.length > 0) {
      // Database table exists and has data
      console.log('✅ Items from database:', result.data);
      res.json({
        success: true,
        data: result.data.map(row => ({ equipment: row.items })),
        total: result.data.length,
        demo: false
      });
    } else {
      // Database table doesn't exist or is empty, use demo data
      console.log('⚠️ No equipment data found in database, using demo data');
      res.json({
        success: true,
        data: sampleEquipment.map(item => ({ equipment: item })),
        total: sampleEquipment.length,
        demo: true
      });
    }
  } catch (error) {
    console.error('Error fetching equipment:', error);
    // Fallback to demo data on error
    res.json({
      success: true,
      data: sampleEquipment.map(item => ({ equipment: item })),
      total: sampleEquipment.length,
      demo: true
    });
  }
});

export default router;
