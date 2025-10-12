import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token - check both admin and customer tokens
    let token = null;
    try {
      // First check for admin token
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken) {
        token = adminToken;
      } else {
        // Then check for customer token
        const customerToken = localStorage.getItem('customer_token');
        if (customerToken) {
          token = customerToken;
        }
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear both admin and customer auth data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_name');
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_name');
      localStorage.removeItem('customer_phone');
      
      // Redirect based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/store/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;