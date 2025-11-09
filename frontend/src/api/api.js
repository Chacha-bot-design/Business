import axios from 'axios';
import { API_ENDPOINTS } from './config';

// Create axios instance with better error handling
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Enhanced error messages
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Cannot connect to server. Please check if the backend is running.';
    } else if (error.response?.status === 404) {
      error.message = 'API endpoint not found. The backend might be missing this endpoint.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// API functions with better error handling
export const productsAPI = {
  getProducts: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRODUCTS_LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },
};

export const reportsAPI = {
  generateAllSummaries: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GENERATE_ALL_SUMMARIES);
      return response.data;
    } catch (error) {
      console.error('Error generating reports:', error);
      throw new Error(`Failed to generate reports: ${error.message}`);
    }
  },

  getLowStock: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LOW_STOCK);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock:', error);
      throw new Error(`Failed to fetch low stock: ${error.message}`);
    }
  },
};

export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(`Backend health check failed: ${error.message}`);
    }
  },
};

export default api;