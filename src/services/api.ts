// API Service for connecting to backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface RepairOrder {
  order_no: string | number;
  subject: string;
  name: string;
  dept: string;
  emp: string;
  insert_date: string;
  items?: string;
  rootcause?: string;
  action?: string;
  emprepair?: string;  // Database field name
  notes?: string;
  last_date: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  error?: string;
  demo?: boolean;
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', fullUrl);
  console.log('📋 Options:', options);
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    console.error('🔗 Failed URL:', fullUrl);
    throw error;
  }
};

// Repair Orders API
export const repairOrdersApi = {
  // Get all repair orders
  getAll: async (params?: {
    status?: string;
    dept?: string;
    emprepair?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<RepairOrder[]>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/repair-orders${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<RepairOrder[]>(endpoint);
  },

  // Get specific repair order
  getById: async (orderNo: string | number): Promise<ApiResponse<RepairOrder>> => {
    return apiRequest<RepairOrder>(`/repair-orders/${orderNo}`);
  },

  // Create new repair order
  create: async (order: Omit<RepairOrder, 'order_no' | 'insert_date' | 'last_date'>): Promise<ApiResponse<RepairOrder>> => {
    return apiRequest<RepairOrder>('/repair-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  // Update repair order
  update: async (orderNo: string | number, updates: Partial<RepairOrder>): Promise<ApiResponse<RepairOrder>> => {
    return apiRequest<RepairOrder>(`/repair-orders/${orderNo}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete repair order
  delete: async (orderNo: string | number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/repair-orders/${orderNo}`, {
      method: 'DELETE',
    });
  },

  // Get dashboard statistics
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/repair-orders/stats/dashboard');
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (params?: { userId?: number; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<any[]>(endpoint);
  },

  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// Subjects API
export const subjectsApi = {
  getAll: async (): Promise<ApiResponse<{ subject: string }[]>> => {
    return apiRequest<{ subject: string }[]>('/subjects');
  },
};

// Departments API
export const departmentsApi = {
  getAll: async (): Promise<ApiResponse<{ DEPT_NAME: string }[]>> => {
    return apiRequest<{ DEPT_NAME: string }[]>('/departments');
  },
};

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    });
  },

  verify: async (token: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
