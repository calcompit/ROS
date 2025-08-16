import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { repairOrdersApi } from '@/services/api';
import { config } from '@/config/environment';

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
    // Return default values when not within DatabaseProvider
    return {
      isConnected: false,
      isLoading: false,
      error: null,
      checkConnection: async () => {}
    };
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
      const statusResponse = await fetch(`${config.apiUrl}/database/status`);
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
    // Only check connection if we're not on login page
    if (window.location.pathname !== '/login') {
      checkConnection();
    } else {
      setIsLoading(false);
    }
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
