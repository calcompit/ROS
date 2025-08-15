import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
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

  useEffect(() => {
    // Get API base URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'https://10.51.101.49:3001';
    
    // Fallback to localhost for development
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const finalApiUrl = isLocalhost ? 'https://localhost:3001' : apiUrl;
    
    const wsUrl = finalApiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
      
      // Join repair-orders room by default
      newSocket.emit('join-room', 'repair-orders');
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
        description: `Order ${data.data.order_no} has been created`,
      });
    });

    newSocket.on('order-updated', (data) => {
      console.log('📡 Order updated:', data);
      toast({
        title: "✏️ Repair Order Updated",
        description: `Order ${data.orderNo} has been updated`,
      });
    });

    newSocket.on('order-deleted', (data) => {
      console.log('📡 Order deleted:', data);
      toast({
        title: "🗑️ Repair Order Deleted",
        description: `Order ${data.orderNo} has been deleted`,
      });
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      newSocket.disconnect();
    };
  }, [toast]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join-room', room);
      console.log(`👥 Joined room: ${room}`);
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave-room', room);
      console.log(`👋 Left room: ${room}`);
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
