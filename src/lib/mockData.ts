// Mock data for Computer Change Tracker

export interface Machine {
  id: string;
  computerName: string;
  ipAddress: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  operatingSystem: string;
}

export interface ChangeLog {
  changeId: string;
  machineId: string;
  changeDate: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeType: 'modified' | 'added' | 'removed';
  description?: string;
}

export const mockMachines: Machine[] = [
  {
    id: 'PC-001',
    computerName: 'DESKTOP-ADMIN01',
    ipAddress: '192.168.1.101',
    lastSeen: '2024-01-18 14:30:25',
    status: 'online',
    location: 'IT Office - Floor 2',
    operatingSystem: 'Windows 11 Pro'
  },
  {
    id: 'PC-002',
    computerName: 'LAPTOP-DEV02',
    ipAddress: '192.168.1.102',
    lastSeen: '2024-01-18 13:45:12',
    status: 'online',
    location: 'Development Team',
    operatingSystem: 'Windows 10 Pro'
  },
  {
    id: 'PC-003',
    computerName: 'WORKSTATION-DESIGN03',
    ipAddress: '192.168.1.103',
    lastSeen: '2024-01-17 16:20:33',
    status: 'offline',
    location: 'Design Department',
    operatingSystem: 'Windows 11 Pro'
  },
  {
    id: 'PC-004',
    computerName: 'SERVER-DB01',
    ipAddress: '192.168.1.104',
    lastSeen: '2024-01-18 14:55:18',
    status: 'maintenance',
    location: 'Server Room',
    operatingSystem: 'Windows Server 2022'
  },
  {
    id: 'PC-005',
    computerName: 'LAPTOP-SALES05',
    ipAddress: '192.168.1.105',
    lastSeen: '2024-01-18 11:30:45',
    status: 'online',
    location: 'Sales Department',
    operatingSystem: 'Windows 11 Home'
  }
];

export const mockChangeLogs: ChangeLog[] = [
  {
    changeId: 'CHG-001',
    machineId: 'PC-001',
    changeDate: '2024-01-18 09:15:22',
    fieldName: 'RAM',
    oldValue: '8 GB',
    newValue: '16 GB',
    changeType: 'modified',
    description: 'Hardware upgrade - RAM expansion'
  },
  {
    changeId: 'CHG-002',
    machineId: 'PC-001',
    changeDate: '2024-01-17 14:22:15',
    fieldName: 'Antivirus Software',
    oldValue: '',
    newValue: 'Windows Defender',
    changeType: 'added',
    description: 'Security software installation'
  },
  {
    changeId: 'CHG-003',
    machineId: 'PC-001',
    changeDate: '2024-01-16 10:30:08',
    fieldName: 'Old Software',
    oldValue: 'Adobe Flash Player',
    newValue: '',
    changeType: 'removed',
    description: 'Obsolete software removal'
  },
  {
    changeId: 'CHG-004',
    machineId: 'PC-002',
    changeDate: '2024-01-18 08:45:33',
    fieldName: 'Operating System',
    oldValue: 'Windows 10 Home',
    newValue: 'Windows 10 Pro',
    changeType: 'modified',
    description: 'OS upgrade for business features'
  },
  {
    changeId: 'CHG-005',
    machineId: 'PC-002',
    changeDate: '2024-01-17 13:20:45',
    fieldName: 'Microsoft Office',
    oldValue: '',
    newValue: 'Office 365 Business',
    changeType: 'added',
    description: 'Productivity suite installation'
  },
  {
    changeId: 'CHG-006',
    machineId: 'PC-003',
    changeDate: '2024-01-15 16:10:12',
    fieldName: 'Graphics Card',
    oldValue: 'GTX 1660',
    newValue: 'RTX 4070',
    changeType: 'modified',
    description: 'Hardware upgrade for design work'
  },
  {
    changeId: 'CHG-007',
    machineId: 'PC-004',
    changeDate: '2024-01-18 12:00:00',
    fieldName: 'Database Software',
    oldValue: 'SQL Server 2019',
    newValue: 'SQL Server 2022',
    changeType: 'modified',
    description: 'Database server upgrade'
  },
  {
    changeId: 'CHG-008',
    machineId: 'PC-005',
    changeDate: '2024-01-17 09:30:25',
    fieldName: 'CRM Software',
    oldValue: '',
    newValue: 'Salesforce Desktop',
    changeType: 'added',
    description: 'Sales team software installation'
  }
];

// API simulation functions
export const getMachines = (): Promise<Machine[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMachines), 500);
  });
};

export const getMachineChangeLogs = (machineId: string): Promise<ChangeLog[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = mockChangeLogs.filter(log => log.machineId === machineId);
      resolve(logs);
    }, 300);
  });
};

export const getAllChangeLogs = (): Promise<ChangeLog[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockChangeLogs), 400);
  });
};