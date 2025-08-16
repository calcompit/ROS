// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://wk-svr01.tail878f89.ts.net/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'https://wk-svr01.tail878f89.ts.net',
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
