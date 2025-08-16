// Environment configuration
export const config = {
  // API URLs for different environments
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:3001',
  
  // Windows backend URLs (when running backend on Windows)
  windowsApiUrl: import.meta.env.VITE_WINDOWS_API_URL || 'http://10.53.64.205:3001/api',
  windowsWsUrl: import.meta.env.VITE_WINDOWS_WS_URL || 'http://10.53.64.205:3001',
  
  // Production URLs
  productionApiUrl: import.meta.env.VITE_PRODUCTION_API_URL || 'https://wk-svr01.tail878f89.ts.net/api',
  productionWsUrl: import.meta.env.VITE_PRODUCTION_WS_URL || 'https://wk-svr01.tail878f89.ts.net',
  
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
};

// Environment presets
export const environments = {
  local: {
    apiUrl: 'http://localhost:3001/api',
    wsUrl: 'http://localhost:3001',
    name: 'Local Development'
  },
  windows: {
    apiUrl: 'http://10.53.64.205:3001/api',
    wsUrl: 'http://10.53.64.205:3001',
    name: 'Windows Backend'
  },
  production: {
    apiUrl: 'https://wk-svr01.tail878f89.ts.net/api',
    wsUrl: 'https://wk-svr01.tail878f89.ts.net',
    name: 'Production'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string = '') => {
  return `${config.apiUrl}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWsUrl = () => {
  return config.wsUrl;
};

// Helper function to get current environment info
export const getCurrentEnvironment = () => {
  if (config.apiUrl.includes('localhost')) {
    return environments.local;
  } else if (config.apiUrl.includes('10.53.64.205')) {
    return environments.windows;
  } else {
    return environments.production;
  }
};

// Helper function to check if running on Windows backend
export const isWindowsBackend = () => {
  return config.apiUrl.includes('10.53.64.205');
};

// Helper function to check if running locally
export const isLocalDevelopment = () => {
  return config.apiUrl.includes('localhost');
};
