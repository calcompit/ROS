import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DemoDatabase {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../demo-data.db');
  }

  async initialize() {
    try {
      console.log('🔄 Initializing demo database...');
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      
      await this.createTables();
      await this.insertSampleData();
      
      console.log('✅ Demo database initialized successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize demo database:', error);
      throw error;
    }
  }

  async createTables() {
    console.log('📝 Creating demo tables...');
    
    // Create repair_orders table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS repair_orders (
        order_no INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        name TEXT NOT NULL,
        dept TEXT NOT NULL,
        emp TEXT NOT NULL,
        device_type TEXT,
        insert_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        items TEXT,
        rootcause TEXT,
        action TEXT,
        emprepair TEXT,
        last_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);

    // Create subjects table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT UNIQUE NOT NULL
      )
    `);

    // Create departments table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dept TEXT UNIQUE NOT NULL
      )
    `);

    // Create equipment table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT UNIQUE NOT NULL
      )
    `);

    console.log('✅ Demo tables created successfully');
  }

  async insertSampleData() {
    console.log('📊 Inserting sample data...');
    
    // Insert subjects
    const subjects = [
      'Blue Screen Error',
      'Install Windows 11',
      'Install Windows 10',
      'Microsoft Office Installation',
      'Hardware Repair',
      'Network Connection Issue',
      'Software Update',
      'Printer Configuration',
      'Email Setup',
      'Virus Removal',
      'Data Recovery',
      'System Performance Issue',
      'Monitor Display Problem',
      'Keyboard/Mouse Issue',
      'Audio/Sound Problem'
    ];

    for (const subject of subjects) {
      await this.db.run('INSERT OR IGNORE INTO subjects (subject) VALUES (?)', [subject]);
    }

    // Insert departments
    const departments = [
      'IT Department',
      'Human Resources',
      'Finance',
      'Marketing',
      'Sales',
      'Operations',
      'Customer Service',
      'Research & Development',
      'Quality Assurance',
      'Production',
      'Logistics',
      'Legal',
      'Administration'
    ];

    for (const dept of departments) {
      await this.db.run('INSERT OR IGNORE INTO departments (dept) VALUES (?)', [dept]);
    }

    // Insert equipment
    const equipment = [
      'RAM',
      'Power Supply',
      'Hard Disk Drive (HDD)',
      'Solid State Drive (SSD)',
      'Motherboard',
      'CPU',
      'Graphics Card (GPU)',
      'Network Card',
      'Keyboard',
      'Mouse',
      'Monitor',
      'Printer',
      'Scanner',
      'Speakers',
      'Webcam'
    ];

    for (const item of equipment) {
      await this.db.run('INSERT OR IGNORE INTO equipment (items) VALUES (?)', [item]);
    }

    // Insert sample repair orders
    const repairOrders = [
      {
        subject: 'Blue Screen Error - Critical System Failure',
        name: 'PC-IT-001',
        dept: 'IT Department',
        emp: 'John Doe',
        device_type: 'Desktop',
        status: 'in-progress',
        items: 'Dell OptiPlex 7090, Intel Core i7, 32GB RAM, 1TB SSD',
        rootcause: 'Corrupted Windows system files and outdated graphics drivers',
        action: 'Performing system restore and driver updates',
        emprepair: 'Sarah Chen',
        notes: 'Critical issue affecting daily operations'
      },
      {
        subject: 'Install Windows 11 Pro',
        name: 'PC-HR-015',
        dept: 'Human Resources',
        emp: 'Jane Smith',
        device_type: 'Laptop',
        status: 'pending',
        items: 'Dell Latitude 5520, Intel Core i5, 16GB RAM, 512GB SSD',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'New laptop setup for HR manager'
      },
      {
        subject: 'Network Printer Not Responding',
        name: 'PRINTER-ACC-02',
        dept: 'Finance',
        emp: 'Mike Johnson',
        device_type: 'Printer',
        status: 'completed',
        items: 'HP LaserJet Pro 4050dn, Network Connection',
        rootcause: 'Network configuration issue and outdated firmware',
        action: 'Updated firmware and reconfigured network settings',
        emprepair: 'David Wilson',
        notes: 'Printer now working properly'
      },
      {
        subject: 'Microsoft Office Installation',
        name: 'PC-MKT-008',
        dept: 'Marketing',
        emp: 'Lisa Brown',
        device_type: 'Desktop',
        status: 'pending',
        items: 'HP EliteDesk 800 G5, Intel Core i7, 16GB RAM',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'Need Office 365 for marketing team'
      },
      {
        subject: 'Hardware Repair - RAM Replacement',
        name: 'PC-OPS-012',
        dept: 'Operations',
        emp: 'Robert Davis',
        device_type: 'Desktop',
        status: 'completed',
        items: 'Lenovo ThinkCentre M90n, Intel Core i5, 8GB RAM',
        rootcause: 'Faulty RAM module causing system instability',
        action: 'Replaced defective RAM module with new 16GB stick',
        emprepair: 'Alex Thompson',
        notes: 'System now stable and performing well'
      },
      {
        subject: 'Email Setup for New Employee',
        name: 'PC-CS-005',
        dept: 'Customer Service',
        emp: 'Emily Wilson',
        device_type: 'Laptop',
        status: 'in-progress',
        items: 'Dell Latitude 3420, Intel Core i3, 8GB RAM',
        rootcause: '',
        action: 'Configuring Outlook and email accounts',
        emprepair: 'Sarah Chen',
        notes: 'New customer service representative setup'
      },
      {
        subject: 'Virus Removal and System Cleanup',
        name: 'PC-SALES-020',
        dept: 'Sales',
        emp: 'Tom Anderson',
        device_type: 'Desktop',
        status: 'pending',
        items: 'HP ProDesk 600 G5, Intel Core i5, 16GB RAM',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'Suspicious activity detected, needs immediate attention'
      },
      {
        subject: 'Monitor Display Problem',
        name: 'PC-RD-003',
        dept: 'Research & Development',
        emp: 'Dr. Maria Garcia',
        device_type: 'Monitor',
        status: 'completed',
        items: 'Dell UltraSharp 27" 4K Monitor, DisplayPort',
        rootcause: 'Loose cable connection and incorrect display settings',
        action: 'Reconnected cables and adjusted display resolution',
        emprepair: 'David Wilson',
        notes: 'Monitor working perfectly now'
      },
      {
        subject: 'System Performance Optimization',
        name: 'PC-QA-018',
        dept: 'Quality Assurance',
        emp: 'Kevin Lee',
        device_type: 'Desktop',
        status: 'in-progress',
        items: 'Dell Precision 3650, Intel Xeon, 64GB RAM',
        rootcause: 'Too many background processes and fragmented disk',
        action: 'Cleaning up startup programs and defragmenting disk',
        emprepair: 'Alex Thompson',
        notes: 'High-performance workstation for QA testing'
      },
      {
        subject: 'Keyboard and Mouse Replacement',
        name: 'PC-ADMIN-007',
        dept: 'Administration',
        emp: 'Patricia White',
        device_type: 'Peripherals',
        status: 'completed',
        items: 'Logitech MX Keys Keyboard, Logitech MX Master Mouse',
        rootcause: 'Worn out keyboard keys and mouse scroll wheel failure',
        action: 'Replaced with new wireless keyboard and mouse set',
        emprepair: 'Sarah Chen',
        notes: 'New peripherals working great'
      },
      {
        subject: 'Audio System Setup',
        name: 'PC-LEGAL-014',
        dept: 'Legal',
        emp: 'Attorney James Miller',
        device_type: 'Audio',
        status: 'pending',
        items: 'Dell OptiPlex 7080, USB Audio Interface, Speakers',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'Need audio setup for video conferencing'
      },
      {
        subject: 'Data Recovery from Failed HDD',
        name: 'PC-LOG-009',
        dept: 'Logistics',
        emp: 'Amanda Taylor',
        device_type: 'Storage',
        status: 'in-progress',
        items: 'Seagate Barracuda 2TB HDD, Data Recovery Software',
        rootcause: 'Hard disk drive failure due to power surge',
        action: 'Attempting data recovery using specialized software',
        emprepair: 'David Wilson',
        notes: 'Critical business data needs to be recovered'
      },
      {
        subject: 'Network Card Installation',
        name: 'PC-PROD-025',
        dept: 'Production',
        emp: 'Carlos Rodriguez',
        device_type: 'Network',
        status: 'completed',
        items: 'Intel Gigabit Network Card, Cat6 Cable',
        rootcause: 'Built-in network card malfunction',
        action: 'Installed new network card and configured settings',
        emprepair: 'Alex Thompson',
        notes: 'Network connectivity restored'
      },
      {
        subject: 'Software Update and Patch Management',
        name: 'PC-IT-030',
        dept: 'IT Department',
        emp: 'IT Support Team',
        device_type: 'Software',
        status: 'pending',
        items: 'Windows 10 Pro, Office 365, Security Updates',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'Bulk software update for IT department machines'
      },
      {
        subject: 'Printer Configuration for New Office',
        name: 'PRINTER-NEW-001',
        dept: 'Marketing',
        emp: 'Marketing Team',
        device_type: 'Printer',
        status: 'completed',
        items: 'Canon imageRUNNER ADVANCE C3530i, Network Setup',
        rootcause: 'New office printer needs network configuration',
        action: 'Configured network settings and installed drivers',
        emprepair: 'Sarah Chen',
        notes: 'New office printer ready for use'
      },
      {
        subject: 'Webcam Installation for Remote Work',
        name: 'PC-HR-022',
        dept: 'Human Resources',
        emp: 'HR Team',
        device_type: 'Webcam',
        status: 'in-progress',
        items: 'Logitech C920 HD Pro Webcam, USB Connection',
        rootcause: 'Built-in webcam not working properly',
        action: 'Installing external webcam and testing video quality',
        emprepair: 'David Wilson',
        notes: 'Needed for remote interviews and meetings'
      },
      {
        subject: 'SSD Upgrade for Performance',
        name: 'PC-FIN-016',
        dept: 'Finance',
        emp: 'Finance Team',
        device_type: 'Storage',
        status: 'completed',
        items: 'Samsung 970 EVO Plus 1TB SSD, Migration Software',
        rootcause: 'Slow system performance due to old HDD',
        action: 'Migrated data to new SSD and optimized system',
        emprepair: 'Alex Thompson',
        notes: 'System now much faster and more responsive'
      },
      {
        subject: 'Graphics Card Upgrade',
        name: 'PC-RD-028',
        dept: 'Research & Development',
        emp: 'R&D Team',
        device_type: 'Graphics',
        status: 'pending',
        items: 'NVIDIA RTX 3060, 650W Power Supply',
        rootcause: '',
        action: '',
        emprepair: '',
        notes: 'Need better graphics for 3D modeling and rendering'
      },
      {
        subject: 'UPS Installation for Power Protection',
        name: 'PC-ADMIN-011',
        dept: 'Administration',
        emp: 'Admin Team',
        device_type: 'Power',
        status: 'completed',
        items: 'APC Back-UPS Pro 1500VA, Power Management Software',
        rootcause: 'Frequent power outages causing data loss',
        action: 'Installed UPS and configured power management',
        emprepair: 'Sarah Chen',
        notes: 'Power protection now in place for critical systems'
      }
    ];

    for (const order of repairOrders) {
      await this.db.run(`
        INSERT INTO repair_orders 
        (subject, name, dept, emp, device_type, status, items, rootcause, action, emprepair, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.subject,
        order.name,
        order.dept,
        order.emp,
        order.device_type,
        order.status,
        order.items,
        order.rootcause,
        order.action,
        order.emprepair,
        order.notes
      ]);
    }

    console.log('✅ Sample data inserted successfully');
  }

  async query(sql, params = []) {
    try {
      if (!this.db) {
        console.log('🔄 Reinitializing demo database...');
        await this.initialize();
      }
      
      const result = await this.db.all(sql, params);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Demo database query error:', error);
      // Try to reinitialize if database is closed
      if (error.code === 'SQLITE_MISUSE' || error.message.includes('Database is closed')) {
        try {
          console.log('🔄 Reinitializing demo database due to closed connection...');
          await this.initialize();
          const result = await this.db.all(sql, params);
          return { success: true, data: result };
        } catch (reinitError) {
          console.error('❌ Failed to reinitialize demo database:', reinitError);
          return { success: false, error: reinitError.message };
        }
      }
      return { success: false, error: error.message };
    }
  }

  async run(sql, params = []) {
    try {
      if (!this.db) {
        console.log('🔄 Reinitializing demo database...');
        await this.initialize();
      }
      
      const result = await this.db.run(sql, params);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Demo database run error:', error);
      // Try to reinitialize if database is closed
      if (error.code === 'SQLITE_MISUSE' || error.message.includes('Database is closed')) {
        try {
          console.log('🔄 Reinitializing demo database due to closed connection...');
          await this.initialize();
          const result = await this.db.run(sql, params);
          return { success: true, data: result };
        } catch (reinitError) {
          console.error('❌ Failed to reinitialize demo database:', reinitError);
          return { success: false, error: reinitError.message };
        }
      }
      return { success: false, error: error.message };
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      console.log('🔒 Demo database connection closed');
    }
  }
}

export default DemoDatabase;
