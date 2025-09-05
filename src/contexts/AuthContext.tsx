import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '@/services/api';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    try {
      // Use real API authentication
      const response = await authApi.login({ username, password });
      
      if (response.success && response.data) {
        const newUser: User = {
          id: response.data.user.id.toString(),
          username: response.data.user.username,
          role: response.data.user.role,
          email: `${response.data.user.username}@example.com`
        };
        
        setUser(newUser);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        localStorage.setItem('authToken', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
