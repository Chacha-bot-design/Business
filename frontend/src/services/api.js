import axios from 'axios';

const API_BASE_URL = 'https://frecha-iotech.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
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