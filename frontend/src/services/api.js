import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api'
  : 'https://business-front.onrender.com/api';

console.log('🔧 API Base URL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - REMOVE MOCK DATA FALLBACK
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Response error for ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response?.status === 403) {
      alert('Access denied: You do not have permission for this action.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API (keep as is since it's for login)
export const authAPI = {
  login: async (credentials) => {
    try {
      const mockUsers = {
        'boss': { 
          id: 1, 
          username: 'boss', 
          role: 'BOSS', 
          email: 'boss@company.com',
          token: 'mock-jwt-token-boss'
        },
        'manager': { 
          id: 2, 
          username: 'manager', 
          role: 'MANAGER', 
          email: 'manager@company.com',
          token: 'mock-jwt-token-manager'
        },
        'seller1': { 
          id: 3, 
          username: 'seller1', 
          role: 'SELLER', 
          email: 'seller1@company.com',
          token: 'mock-jwt-token-seller'
        }
      };
      
      if (mockUsers[credentials.username] && credentials.password === 'password') {
        const user = mockUsers[credentials.username];
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
        return { data: user };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Users API - REMOVE MOCK DATA
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response;
  },

  create: async (userData) => {
    const response = await api.post('/users/', userData);
    return response;
  },

  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}/`, userData);
    return response;
  },

  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}/`);
    return response;
  },

  resetPassword: async (userId, passwordData) => {
    const response = await api.post(`/users/${userId}/reset_password/`, passwordData);
    return response;
  },

  getStatistics: async () => {
    const response = await api.get('/users/statistics/');
    return response;
  }
};

// Products API - REMOVE MOCK DATA
export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/products/');
    return response;
  },

  getLowStock: async () => {
    const response = await api.get('/products/low-stock/');
    return response;
  },

  create: async (productData) => {
    const response = await api.post('/products/', productData);
    return response;
  },

  update: async (productId, productData) => {
    const response = await api.put(`/products/${productId}/`, productData);
    return response;
  },

  delete: async (productId) => {
    const response = await api.delete(`/products/${productId}/`);
    return response;
  }
};

// Sales API - REMOVE MOCK DATA
export const salesAPI = {
  create: async (saleData) => {
    const response = await api.post('/sales/', saleData);
    return response;
  },
  
  getAll: async () => {
    const response = await api.get('/sales/');
    return response;
  }
};

// Reports API - REMOVE MOCK DATA
export const reportsAPI = {
  profitLossReport: async () => {
    const response = await api.get('/sales/profit_loss_report/');
    return response;
  }
};

export default api;