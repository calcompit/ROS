import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://');

console.log('🔌 Testing WebSocket connection...');
console.log('📍 Server URL:', API_URL);
console.log('🔌 WebSocket URL:', wsUrl);

const socket = io(wsUrl, {
  transports: ['polling', 'websocket'],
  timeout: 10000,
  reconnection: false,
  rejectUnauthorized: false,
  secure: false
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('📋 Socket ID:', socket.id);
  console.log('🔧 Transport:', socket.io.engine.transport.name);
  
  // Join repair-orders room
  socket.emit('join-room', 'repair-orders');
  console.log('👥 Joined repair-orders room');
  
  // Send a test message
  socket.emit('test-message', {
    message: 'Hello from HTTP test script!',
    timestamp: new Date().toISOString()
  });
  console.log('📨 Sent test message');
  
  // Emit test events
  setTimeout(() => {
    socket.emit('order-created', {
      data: {
        order_no: 'HTTP-TEST-' + Date.now(),
        subject: 'HTTP Test Order',
        name: 'HTTP Test User',
        dept: 'IT',
        status: 'pending'
      }
    });
    console.log('🆕 Emitted order-created event');
  }, 1000);
  
  setTimeout(() => {
    socket.emit('order-updated', {
      orderNo: 'HTTP-TEST-' + Date.now(),
      subject: 'Updated HTTP Test Order',
      status: 'in-progress'
    });
    console.log('✏️ Emitted order-updated event');
  }, 2000);
  
  setTimeout(() => {
    socket.emit('order-deleted', {
      orderNo: 'HTTP-TEST-' + Date.now()
    });
    console.log('🗑️ Emitted order-deleted event');
  }, 3000);
  
  // Disconnect after 5 seconds
  setTimeout(() => {
    console.log('⏰ Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('disconnect', () => {
  console.log('❌ WebSocket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
  process.exit(1);
});

socket.on('test-message-received', (data) => {
  console.log('📨 Test message received:', data);
});

socket.on('order-created', (data) => {
  console.log('🆕 Order created event received:', data);
});

socket.on('order-updated', (data) => {
  console.log('✏️ Order updated event received:', data);
});

socket.on('order-deleted', (data) => {
  console.log('🗑️ Order deleted event received:', data);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Disconnecting WebSocket...');
  socket.disconnect();
  process.exit(0);
});
