import axios from 'axios';
import type {
  ApiResponse,
  Product,
  Order,
  CreateOrderData,
  Customer,
  Category,
  StoreInfo,
  PaginationParams,
  PaginationResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance for customer API (no auth required)
const customerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product Browsing
export const customerProducts = {
  getAll: async (params?: PaginationParams & { category?: string; minPrice?: number; maxPrice?: number }): Promise<ApiResponse<{ products: Product[]; pagination: PaginationResponse }>> => {
    const response = await customerApi.get('/api/customer/products', { params });
    return response.data;
  },

  getById: async (productID: string): Promise<ApiResponse<{ product: Product; relatedProducts: Product[] }>> => {
    const response = await customerApi.get(`/api/customer/products/${productID}`);
    return response.data;
  },

  search: async (query: string, type?: string): Promise<ApiResponse<{ type: string; items: any[] }[]>> => {
    const response = await customerApi.get('/api/customer/search', { params: { q: query, type } });
    return response.data;
  },
};

// Categories
export const customerCategories = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await customerApi.get('/api/customer/categories');
    return response.data;
  },
};

// Order Management
export const customerOrders = {
  create: async (data: CreateOrderData): Promise<ApiResponse<{ orderId: string; totalAmount: number; estimatedDelivery: string }>> => {
    const response = await customerApi.post('/api/customer/orders', data);
    return response.data;
  },

  track: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await customerApi.get(`/api/customer/orders/${orderId}/track`);
    return response.data;
  },

  getHistory: async (phone: string, params?: PaginationParams & { status?: string }): Promise<ApiResponse<{ customer: Customer | null; orders: Order[]; pagination: PaginationResponse }>> => {
    const response = await customerApi.get(`/api/customer/customers/${phone}/orders`, { params });
    return response.data;
  },

  getDetails: async (phone: string, orderId: string): Promise<ApiResponse<Order>> => {
    const response = await customerApi.get(`/api/customer/customers/${phone}/orders/${orderId}`);
    return response.data;
  },
};

// Authentication
export const customerAuth = {
  signIn: async (phone: string, password: string): Promise<ApiResponse<{ customerID: string; token: string; customer: Customer }>> => {
    const response = await customerApi.post('/api/customer/signin', { phone, password });
    return response.data;
  },

  signUp: async (data: { name: string; email?: string; phone: string; password: string; address?: string }): Promise<ApiResponse<{ customerID: string; token: string; customer: Customer }>> => {
    const response = await customerApi.post('/api/customer/signup', data);
    return response.data;
  },
};

// Store Information
export const storeInfo = {
  get: async (): Promise<ApiResponse<StoreInfo>> => {
    const response = await customerApi.get('/api/customer/store-info');
    return response.data;
  },
};