// Environment configuration
export const config = {
  // API Configuration - Use HTTPS with SSL ignore in development
  apiUrl: import.meta.env.VITE_API_URL || 'https://10.51.101.49:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://10.51.101.49:3001',
  
  // App Configuration
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Development settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Tailscale IP for Windows backend
  windowsBackendIP: '10.51.101.49',
  windowsBackendPort: 3001,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string = '') => {
  return `${config.apiUrl}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = () => {
  return config.wsUrl;
};
