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

// Response interceptor
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
    
    if (error.response?.status === 404) {
      console.log('📊 Endpoint not found, returning mock data...');
      return Promise.resolve({
        data: generateMockDataForEndpoint(error.config.url),
        status: 200,
        statusText: 'OK',
        config: error.config,
        headers: {}
      });
    }
    
    if (error.response?.status === 403) {
      alert('Access denied: You do not have permission for this action.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      // Mock login - replace with actual API call
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

// Users API (Boss only)
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/users/');
      return response;
    } catch (error) {
      return {
        data: generateMockUsers(),
        status: 200
      };
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post('/users/', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}/`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  resetPassword: async (userId, passwordData) => {
    try {
      const response = await api.post(`/users/${userId}/reset_password/`, passwordData);
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const response = await api.get('/users/statistics/');
      return response;
    } catch (error) {
      return {
        data: {
          total_users: 4,
          active_users: 3,
          recent_signups: 1,
          users_by_role: [
            { role: 'BOSS', count: 1 },
            { role: 'MANAGER', count: 1 },
            { role: 'SELLER', count: 2 }
          ]
        },
        status: 200
      };
    }
  }
};

// Products API
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/products/');
      return response;
    } catch (error) {
      return {
        data: generateMockProducts(),
        status: 200
      };
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get('/products/low-stock/');
      return response;
    } catch (error) {
      return {
        data: generateMockLowStock(),
        status: 200
      };
    }
  },

  create: async (productData) => {
    try {
      const response = await api.post('/products/', productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}/`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}/`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Sales API
export const salesAPI = {
  create: async (saleData) => {
    try {
      const response = await api.post('/sales/', saleData);
      return response;
    } catch (error) {
      console.error('Sale creation error:', error);
      throw error;
    }
  },
  
  getAll: async () => {
    try {
      const response = await api.get('/sales/');
      return response;
    } catch (error) {
      return {
        data: generateMockSales(),
        status: 200
      };
    }
  }
};

// Reports API
export const reportsAPI = {
  profitLossReport: async () => {
    try {
      const response = await api.get('/sales/profit_loss_report/');
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('Only Boss can access profit reports');
      }
      return {
        data: generateMockProfitReport(),
        status: 200
      };
    }
  }
};

// Mock data generators
const generateMockUsers = () => [
  {
    id: 2,
    username: 'manager1',
    email: 'manager@company.com',
    role: 'MANAGER',
    phone: '+1234567890',
    employee_id: 'EMPMAN0001',
    is_active: true,
    date_joined: '2024-01-15T00:00:00Z',
    first_name: 'John',
    last_name: 'Manager',
    total_sales: 45,
    total_revenue: 1250000
  },
  {
    id: 3,
    username: 'seller1',
    email: 'seller1@company.com',
    role: 'SELLER',
    phone: '+1234567891',
    employee_id: 'EMPSELL0001',
    is_active: true,
    date_joined: '2024-01-20T00:00:00Z',
    first_name: 'Jane',
    last_name: 'Seller',
    total_sales: 120,
    total_revenue: 3500000
  },
  {
    id: 4,
    username: 'seller2',
    email: 'seller2@company.com',
    role: 'SELLER',
    phone: '+1234567892',
    employee_id: 'EMPSELL0002',
    is_active: false,
    date_joined: '2024-02-01T00:00:00Z',
    first_name: 'Bob',
    last_name: 'Salesman',
    total_sales: 80,
    total_revenue: 2200000
  }
];

const generateMockProducts = () => [
  { 
    id: 1, 
    name: "4G Data Plan 10GB", 
    category_name: "Data Plans", 
    price: 25000, 
    cost_price: 15000,
    profit_margin: 10000,
    stock_quantity: 100,
    min_stock_level: 10,
    is_active: true
  },
  { 
    id: 2, 
    name: "Fiber Optic Router", 
    category_name: "Routers", 
    price: 299999, 
    cost_price: 199999,
    profit_margin: 100000,
    stock_quantity: 15,
    min_stock_level: 5,
    is_active: true
  },
  { 
    id: 3, 
    name: "Business Bundle", 
    category_name: "Bundles", 
    price: 150000, 
    cost_price: 90000,
    profit_margin: 60000,
    stock_quantity: 25,
    min_stock_level: 5,
    is_active: true
  }
];

const generateMockLowStock = () => [
  { id: 4, name: "Wireless Access Point", current_stock: 8, min_stock: 10 },
  { id: 6, name: "CAT6 Ethernet Cable", current_stock: 5, min_stock: 20 }
];

const generateMockSales = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    seller_name: `Seller ${(i % 3) + 1}`,
    total_amount: Math.floor(Math.random() * 100000) + 5000,
    profit: Math.floor(Math.random() * 30000) + 1000,
    sale_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    payment_method: ['CASH', 'CARD', 'MOMO'][i % 3]
  }));
};

const generateMockProfitReport = () => ({
  daily: {
    total_sales: 1250000,
    total_profit: 400000,
    transaction_count: 45
  },
  weekly: {
    total_sales: 8750000,
    total_profit: 2800000,
    transaction_count: 315
  },
  monthly: {
    total_sales: 35000000,
    total_profit: 11200000,
    transaction_count: 1260
  },
  yearly: {
    total_sales: 420000000,
    total_profit: 134400000,
    transaction_count: 15120
  },
  top_products: [
    { product__name: "4G Data Plan 10GB", total_sold: 150, total_revenue: 3750000, total_profit: 1500000 },
    { product__name: "Fiber Optic Router", total_sold: 80, total_revenue: 23999920, total_profit: 8000000 }
  ]
});

const generateMockDataForEndpoint = (endpoint) => {
  if (endpoint.includes('/users')) {
    return generateMockUsers();
  } else if (endpoint.includes('/products')) {
    return generateMockProducts();
  } else if (endpoint.includes('/sales')) {
    return generateMockSales();
  } else if (endpoint.includes('/reports')) {
    return generateMockProfitReport();
  }
  return { message: 'Mock data', endpoint };
};

export default api;