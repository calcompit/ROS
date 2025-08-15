import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';
import { config } from '../config/environment.js';

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
    throw new Error('useWebSocket must be used within a WebSocketProvider');
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

  // Event handlers storage
  const [orderCreatedHandlers, setOrderCreatedHandlers] = useState<((data: any) => void)[]>([]);
  const [orderUpdatedHandlers, setOrderUpdatedHandlers] = useState<((data: any) => void)[]>([]);
  const [orderDeletedHandlers, setOrderDeletedHandlers] = useState<((data: any) => void)[]>([]);

  useEffect(() => {
    const wsUrl = config.wsUrl;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: false,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      },
      // For development, use ws:// protocol
      ...(import.meta.env.DEV && {
        secure: false,
      })
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join repair-orders room by default
      newSocket.emit('join', 'repair-orders');
      console.log('👥 Auto-joined repair-orders room');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('order-created', (data) => {
      console.log('📡 Order created:', data);
      toast({
        title: "🆕 New Repair Order",
        description: `Order ${data.data?.order_no || data.orderNo} has been created`,
      });
      // Call all registered handlers
      orderCreatedHandlers.forEach(handler => handler(data));
    });

    newSocket.on('order-updated', (data) => {
      console.log('📡 Order updated event received:', data);
      console.log('📡 Event data structure:', {
        orderNo: data.orderNo,
        data: data.data,
        action: data.action
      });
      console.log('📡 Registered handlers count:', orderUpdatedHandlers.length);
      toast({
        title: "✏️ Repair Order Updated",
        description: `Order ${data.orderNo || data.data?.order_no} has been updated`,
      });
      // Call all registered handlers
      orderUpdatedHandlers.forEach((handler, index) => {
        console.log(`📡 Calling handler ${index + 1}:`, handler);
        try {
          handler(data);
        } catch (error) {
          console.error(`📡 Error in handler ${index + 1}:`, error);
        }
      });
    });

    newSocket.on('order-deleted', (data) => {
      console.log('📡 Order deleted:', data);
      toast({
        title: "🗑️ Repair Order Deleted",
        description: `Order ${data.orderNo} has been deleted`,
      });
      // Call all registered handlers
      orderDeletedHandlers.forEach(handler => handler(data));
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      newSocket.disconnect();
    };
  }, [toast]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join', room);
      console.log(`👥 Joined room: ${room}`);
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave', room);
      console.log(`👋 Left room: ${room}`);
    }
  };

  // Event handler functions - use useCallback to prevent infinite loops
  const onOrderCreated = React.useCallback((callback: (data: any) => void) => {
    setOrderCreatedHandlers(prev => [...prev, callback]);
  }, []);

  const onOrderUpdated = React.useCallback((callback: (data: any) => void) => {
    setOrderUpdatedHandlers(prev => [...prev, callback]);
  }, []);

  const onOrderDeleted = React.useCallback((callback: (data: any) => void) => {
    setOrderDeletedHandlers(prev => [...prev, callback]);
  }, []);

  const offOrderCreated = React.useCallback((callback: (data: any) => void) => {
    setOrderCreatedHandlers(prev => prev.filter(handler => handler !== callback));
  }, []);

  const offOrderUpdated = React.useCallback((callback: (data: any) => void) => {
    setOrderUpdatedHandlers(prev => prev.filter(handler => handler !== callback));
  }, []);

  const offOrderDeleted = React.useCallback((callback: (data: any) => void) => {
    setOrderDeletedHandlers(prev => prev.filter(handler => handler !== callback));
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
