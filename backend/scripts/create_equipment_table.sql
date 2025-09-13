-- Create TBL_IT_PCEQUIPMENT table
USE [mes];
GO

-- Drop table if exists
IF OBJECT_ID('dbo.TBL_IT_PCEQUIPMENT', 'U') IS NOT NULL
    DROP TABLE dbo.TBL_IT_PCEQUIPMENT;
GO

-- Create table
CREATE TABLE dbo.TBL_IT_PCEQUIPMENT (
    id INT IDENTITY(1,1) PRIMARY KEY,
    equipment NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    category NVARCHAR(50) NULL,
    created_date DATETIME DEFAULT GETDATE(),
    updated_date DATETIME DEFAULT GETDATE()
);
GO

-- Insert sample data
INSERT INTO dbo.TBL_IT_PCEQUIPMENT (equipment, description, category) VALUES
('RAM', 'Random Access Memory', 'Memory'),
('POWERSUPPLY', 'Power Supply Unit', 'Power'),
('HDD', 'Hard Disk Drive', 'Storage'),
('SSD', 'Solid State Drive', 'Storage'),
('MOTHERBOARD', 'Motherboard', 'Mainboard'),
('CPU', 'Central Processing Unit', 'Processor'),
('GPU', 'Graphics Processing Unit', 'Graphics'),
('NETWORK', 'Network Card/Adapter', 'Network'),
('KEYBOARD', 'Keyboard', 'Input'),
('MOUSE', 'Mouse', 'Input'),
('MONITOR', 'Monitor/Display', 'Display'),
('PRINTER', 'Printer', 'Output'),
('SCANNER', 'Scanner', 'Input'),
('FAN', 'Cooling Fan', 'Cooling'),
('CABLE', 'Various Cables', 'Cables'),
('ADAPTER', 'Power/Data Adapters', 'Adapters');
GO

-- Create index for better performance
CREATE INDEX IX_TBL_IT_PCEQUIPMENT_equipment ON dbo.TBL_IT_PCEQUIPMENT(equipment);
GO

-- Verify data
SELECT * FROM dbo.TBL_IT_PCEQUIPMENT ORDER BY equipment;
GO
