import axios from 'axios';

// API base URL - make sure this matches your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://business-system.onrender.com/api';

console.log('🔧 Using API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API response received: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Enhanced error messages
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    } else if (error.response?.status === 404) {
      error.message = 'API endpoint not found. The backend might be missing this endpoint.';
    }
    
    return Promise.reject(error);
  }
);

// Reports API
export const reportsAPI = {
  lowStock: async () => {
    try {
      const response = await api.get('/reports/low_stock/');
      return response;
    } catch (error) {
      console.error('Error in lowStock API:', error);
      throw error;
    }
  },
  
  generateAllSummaries: async () => {
    try {
      const response = await api.get('/reports/generate_all_summaries/');
      return response;
    } catch (error) {
      console.error('Error in generateAllSummaries API:', error);
      throw error;
    }
  }
};

// Products API
export const productAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/products/');
      return response;
    } catch (error) {
      console.error('Error in productAPI.getAll:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}/`);
      return response;
    } catch (error) {
      console.error('Error in productAPI.getById:', error);
      throw error;
    }
  },
  
  create: async (productData) => {
    try {
      const response = await api.post('/products/', productData);
      return response;
    } catch (error) {
      console.error('Error in productAPI.create:', error);
      throw error;
    }
  },
  
  update: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}/`, productData);
      return response;
    } catch (error) {
      console.error('Error in productAPI.update:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/products/${id}/`);
      return response;
    } catch (error) {
      console.error('Error in productAPI.delete:', error);
      throw error;
    }
  }
};

// Transactions API - ADD THIS SECTION
export const transactionAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/transactions/');
      return response;
    } catch (error) {
      console.error('Error in transactionAPI.getAll:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}/`);
      return response;
    } catch (error) {
      console.error('Error in transactionAPI.getById:', error);
      throw error;
    }
  },
  
  create: async (transactionData) => {
    try {
      const response = await api.post('/transactions/', transactionData);
      return response;
    } catch (error) {
      console.error('Error in transactionAPI.create:', error);
      throw error;
    }
  },
  
  update: async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}/`, transactionData);
      return response;
    } catch (error) {
      console.error('Error in transactionAPI.update:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}/`);
      return response;
    } catch (error) {
      console.error('Error in transactionAPI.delete:', error);
      throw error;
    }
  }
};

// Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health/');
      return response;
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  }
};

export default api;