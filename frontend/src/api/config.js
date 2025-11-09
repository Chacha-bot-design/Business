// API Configuration
const getApiBaseUrl = () => {
  // Check if the environment variable is set
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Fallback URLs based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'https://business-front.onrender.com/api';
  }
  
  // Development fallback
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Frontend API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL: API_BASE_URL
});

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCTS_LIST: `${API_BASE_URL}/products/`,
  
  // Reports
  REPORTS: `${API_BASE_URL}/reports`,
  LOW_STOCK: `${API_BASE_URL}/reports/low_stock/`,
  GENERATE_ALL_SUMMARIES: `${API_BASE_URL}/reports/generate_all_summaries/`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health/`,
}