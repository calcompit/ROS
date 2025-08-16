import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { repairOrdersApi } from '@/services/api';

interface DatabaseContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  checkConnection: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check database status
      const statusResponse = await fetch('http://localhost:3001/api/database/status');
      const statusData = await statusResponse.json();
      
      if (statusData.success && statusData.data.connected) {
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setError('Database connection failed');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Network error - cannot reach server');
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    checkConnection();
  }, []);

  const value: DatabaseContextType = {
    isConnected,
    isLoading,
    error,
    checkConnection,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
