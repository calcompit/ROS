-- Create TBL_IT_MAINTAINUSER table
USE [mes];
GO

-- Drop table if exists
IF OBJECT_ID('dbo.TBL_IT_MAINTAINUSER', 'U') IS NOT NULL
    DROP TABLE dbo.TBL_IT_MAINTAINUSER;
GO

-- Create table
CREATE TABLE dbo.TBL_IT_MAINTAINUSER (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NULL,
    role NVARCHAR(20) DEFAULT 'admin',
    department NVARCHAR(100) DEFAULT 'IT Department',
    is_active BIT DEFAULT 1,
    created_date DATETIME DEFAULT GETDATE(),
    updated_date DATETIME DEFAULT GETDATE()
);
GO

-- Insert admin user with hashed password (admin123)
INSERT INTO dbo.TBL_IT_MAINTAINUSER (username, password, full_name, role, department) VALUES
('admin', '$2a$10$imAEOvLYnL3ZNqDwG2aIpeDyiNxIELqGXuNXrp5SweUaY4KfHhPu2', 'System Administrator', 'admin', 'IT Department');
GO

-- Create index for better performance
CREATE INDEX IX_TBL_IT_MAINTAINUSER_username ON dbo.TBL_IT_MAINTAINUSER(username);
GO

-- Verify data
SELECT * FROM dbo.TBL_IT_MAINTAINUSER;
GO
