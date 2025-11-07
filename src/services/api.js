import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const productAPI = {
  getAll: () => api.get('/products/'),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions/'),
  create: (data) => api.post('/transactions/', data),
};

export const reportsAPI = {
  generateAll: () => api.get('/reports/generate_all_summaries/'),
  lowStock: () => api.get('/reports/low_stock/'),
};