import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { repairOrdersApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface DatabaseContextType {
  isConnected: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  error: string | null;
  checkConnection: () => Promise<void>;
  forceRedirectToError: () => void;
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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await repairOrdersApi.getAll();
      
      if (response.success) {
        if (response.demo) {
          setIsDemoMode(true);
          setIsConnected(false);
          setError('Database connection failed - running in demo mode');
        } else {
          setIsDemoMode(false);
          setIsConnected(true);
          setError(null);
        }
      } else {
        setIsDemoMode(false);
        setIsConnected(false);
        setError('Failed to connect to database');
      }
    } catch (err) {
      setIsDemoMode(false);
      setIsConnected(false);
      setError('Network error - cannot reach server');
    } finally {
      setIsLoading(false);
    }
  };

  const forceRedirectToError = () => {
    navigate('/database-error');
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-redirect to error page if database is not connected
  useEffect(() => {
    if (!isLoading && !isConnected && !isDemoMode && error) {
      // Only redirect if we're not already on the error page and there's an error
      if (window.location.pathname !== '/database-error') {
        navigate('/database-error');
      }
    }
  }, [isLoading, isConnected, isDemoMode, error, navigate]);

  const value: DatabaseContextType = {
    isConnected,
    isDemoMode,
    isLoading,
    error,
    checkConnection,
    forceRedirectToError,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
