// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://10.51.101.49:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'http://10.51.101.49:3001',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string = '') => {
  return `${config.apiUrl}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = () => {
  return config.wsUrl;
};
