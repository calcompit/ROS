# TechFix Pro - Repair Order Management System

## Project Overview

TechFix Pro is a comprehensive repair order management system designed for IT departments and technical service teams. The system provides a modern, user-friendly interface for managing computer repair orders, tracking status, and maintaining detailed records.

## Features

- **Dashboard Overview**: Real-time statistics and repair order summaries
- **Role-Based Access Control**: Admin users can edit tickets, regular users can view only
- **Repair Order Management**: Create, edit, delete, and track repair orders
- **Status Tracking**: Monitor repair progress with visual status indicators
- **Priority Management**: Set and track priority levels for urgent repairs
- **Department Integration**: Connect with existing department structures
- **Database Integration**: Full SQL Server integration for data persistence

## Technology Stack

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQL Server
- **Authentication**: JWT-based admin authentication
- **Deployment**: Netlify (Frontend), Local Backend

## Quick Start

### Prerequisites

- Node.js 18+ installed
- SQL Server database access
- Git

### Installation

```sh
# Clone the repository
git clone https://github.com/calcompit/ROS.git

# Navigate to project directory
cd ROS

# Install dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start development server
npm run dev
```

### Backend Setup

```sh
# Navigate to backend directory
cd backend

# Create .env file with database credentials
cp .env.example .env

# Edit .env with your database settings
# DB_SERVER=your_server_ip
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=your_database_name

# Start backend server
npm start
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
DB_SERVER=10.53.64.205
DB_USER=ccet
DB_PASSWORD=!qaz7410
DB_NAME=mes
DB_PORT=1433
JWT_SECRET=your_jwt_secret
```

## Database Schema

The system integrates with existing SQL Server tables:

- `TBL_IT_PCMAINTENANCE`: Main repair orders table
- `TBL_IT_PCSUBJECT`: Issue types/subjects
- `TBL_IP_DEPT`: Department information
- `TBL_IT_MAINTAINUSER`: Admin user credentials

## Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Backend (Local/Server)
1. Deploy backend to your server
2. Configure CORS for frontend domain
3. Set up SSL certificates for HTTPS
4. Configure firewall rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software developed for internal use.

## Support

For technical support or questions, please contact the development team.
