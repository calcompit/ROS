import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { config, getWsUrl } from '../config/environment.js';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  onOrderCreated: (callback: (data: any) => void) => void;
  onOrderUpdated: (callback: (data: any) => void) => void;
  onOrderDeleted: (callback: (data: any) => void) => void;
  offOrderCreated: (callback: (data: any) => void) => void;
  offOrderUpdated: (callback: (data: any) => void) => void;
  offOrderDeleted: (callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    // Return default values when not within WebSocketProvider
    return {
      socket: null,
      isConnected: false,
      joinRoom: () => {},
      leaveRoom: () => {},
      onOrderCreated: () => {},
      onOrderUpdated: () => {},
      onOrderDeleted: () => {},
      offOrderCreated: () => {},
      offOrderUpdated: () => {},
      offOrderDeleted: () => {}
    };
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Event handlers storage using refs to avoid closure issues
  const orderCreatedHandlersRef = useRef<((data: any) => void)[]>([]);
  const orderUpdatedHandlersRef = useRef<((data: any) => void)[]>([]);
  const orderDeletedHandlersRef = useRef<((data: any) => void)[]>([]);

  useEffect(() => {
    // Only connect WebSocket if we're not on login page
    if (window.location.pathname === '/login') {
      return;
    }

    const wsUrl = getWsUrl();
    
    if (import.meta.env.DEV) {
      console.log('🔌 Connecting to WebSocket:', wsUrl);
    }
    
    const newSocket = io(wsUrl, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: false,

      // For development with self-signed certificate
      ...(import.meta.env.DEV && {
        secure: true,
        rejectUnauthorized: false,
        transports: ['polling', 'websocket']
      }),
      // For production
      ...(import.meta.env.PROD && {
        secure: true,
        rejectUnauthorized: false
      })
    });

    newSocket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket connected:', newSocket.id);
      }
      setIsConnected(true);
      
      // Join repair-orders room by default
      newSocket.emit('join-room', 'repair-orders');
      if (import.meta.env.DEV) {
        console.log('👥 Auto-joined repair-orders room');
      }
    });

    newSocket.on('disconnect', () => {
      if (import.meta.env.DEV) {
        console.log('❌ WebSocket disconnected');
      }
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      if (import.meta.env.DEV) {
        console.error('❌ WebSocket connection error:', error);
      }
      setIsConnected(false);
      
      // Try to reconnect with different transport if websocket fails
      if (error.message.includes('websocket')) {
        if (import.meta.env.DEV) {
          console.log('🔄 Trying to reconnect with polling transport...');
        }
        setTimeout(() => {
          newSocket.io.opts.transports = ['polling'];
          newSocket.connect();
        }, 2000);
      }
    });

    newSocket.on('order-created', (data) => {
      if (import.meta.env.DEV) {
        console.log('📡 Order created event received:', data);
        console.log('📡 Data structure:', {
          data: data.data,
          orderNo: data.orderNo,
          fullData: data
        });
        console.log('📡 Registered handlers count:', orderCreatedHandlersRef.current.length);
      }
      
      toast({
        title: "🆕 New Repair Order",
        description: `Order ${data.data?.order_no || data.orderNo} has been created`,
      });
      
      // Call all registered handlers
      orderCreatedHandlersRef.current.forEach((handler, index) => {
        if (import.meta.env.DEV) {
          console.log(`📡 Calling order-created handler ${index + 1}:`, handler);
        }
        try {
          handler(data);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`📡 Error in order-created handler ${index + 1}:`, error);
          }
        }
      });
    });

    newSocket.on('order-updated', (data) => {
      if (import.meta.env.DEV) {
        console.log('📡 Order updated event received:', data);
        console.log('📡 Event data structure:', {
          orderNo: data.orderNo,
          data: data.data,
          action: data.action
        });
        console.log('📡 Registered handlers count:', orderUpdatedHandlersRef.current.length);
        console.log('📡 All registered handlers:', orderUpdatedHandlersRef.current);
      }
      toast({
        title: "✏️ Repair Order Updated",
        description: `Order ${data.orderNo || data.data?.order_no} has been updated`,
      });
      // Call all registered handlers
      orderUpdatedHandlersRef.current.forEach((handler, index) => {
        if (import.meta.env.DEV) {
          console.log(`📡 Calling handler ${index + 1}:`, handler);
        }
        try {
          handler(data);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`📡 Error in handler ${index + 1}:`, error);
          }
        }
      });
    });

    newSocket.on('order-deleted', (data) => {
      if (import.meta.env.DEV) {
        console.log('📡 Order deleted:', data);
      }
      toast({
        title: "🗑️ Repair Order Deleted",
        description: `Order ${data.orderNo} has been deleted`,
      });
      // Call all registered handlers
      orderDeletedHandlersRef.current.forEach(handler => handler(data));
    });

    setSocket(newSocket);

    return () => {
      if (import.meta.env.DEV) {
        console.log('🔌 Disconnecting WebSocket');
      }
      newSocket.disconnect();
    };
  }, [toast]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join-room', room);
      if (import.meta.env.DEV) {
        console.log(`👥 Joined room: ${room}`);
      }
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave', room);
      if (import.meta.env.DEV) {
        console.log(`👋 Left room: ${room}`);
      }
    }
  };

  // Event handler functions - use useCallback to prevent infinite loops
  const onOrderCreated = useCallback((callback: (data: any) => void) => {
    orderCreatedHandlersRef.current = [...orderCreatedHandlersRef.current, callback];
  }, []);

  const onOrderUpdated = useCallback((callback: (data: any) => void) => {
    orderUpdatedHandlersRef.current = [...orderUpdatedHandlersRef.current, callback];
  }, []);

  const onOrderDeleted = useCallback((callback: (data: any) => void) => {
    orderDeletedHandlersRef.current = [...orderDeletedHandlersRef.current, callback];
  }, []);

  const offOrderCreated = useCallback((callback: (data: any) => void) => {
    orderCreatedHandlersRef.current = orderCreatedHandlersRef.current.filter(handler => handler !== callback);
  }, []);

  const offOrderUpdated = useCallback((callback: (data: any) => void) => {
    orderUpdatedHandlersRef.current = orderUpdatedHandlersRef.current.filter(handler => handler !== callback);
  }, []);

  const offOrderDeleted = useCallback((callback: (data: any) => void) => {
    orderDeletedHandlersRef.current = orderDeletedHandlersRef.current.filter(handler => handler !== callback);
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    onOrderCreated,
    onOrderUpdated,
    onOrderDeleted,
    offOrderCreated,
    offOrderUpdated,
    offOrderDeleted,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
