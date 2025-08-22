// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wk-svr01.neofelis-mooneye.ts.net/api';

console.log('API URL:', API_BASE_URL);

// API Client
export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  get: <T>(endpoint: string): Promise<T> => {
    return apiClient.request<T>(endpoint);
  },

  post: <T>(endpoint: string, data: any): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: <T>(endpoint: string, data: any): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return apiClient.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};

// API Endpoints
export const apiEndpoints = {
  // Computer Change Tracker endpoints
  machines: '/machines',
  machineChangeLogs: (machineId: string) => `/machines/${machineId}/changes`,
  changeLogs: '/changes',
  reports: '/reports',
  
  // FixIt Bright Dashboard endpoints
  repairOrders: '/repair-orders',
  repairOrderStats: '/repair-orders/stats/dashboard',
  repairOrderById: (id: string) => `/repair-orders/${id}`,
} as const;
