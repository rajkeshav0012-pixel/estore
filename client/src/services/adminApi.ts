import api from '../lib/api';
import type {
  ApiResponse,
  LoginCredentials,
  SignupData,
  AuthResponse,
  DashboardData,
  Product,
  CreateProductData,
  Order,
  Customer,
  Category,
  PaginationParams,
  PaginationResponse
} from '../types';

// Admin Authentication
export const adminAuth = {
  signup: async (data: SignupData): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/admin/signup', data);
    return response.data;
  },

  signin: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/api/admin/signin', credentials);
    return response.data;
  },
};

// Dashboard
export const dashboard = {
  getStats: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },
};

// Product Management
export const products = {
  getAll: async (params?: PaginationParams & { category?: string; minPrice?: number; maxPrice?: number }): Promise<ApiResponse<{ products: Product[]; pagination: PaginationResponse }>> => {
    const response = await api.get('/api/admin/products', { params });
    return response.data;
  },

  getById: async (productID: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/api/admin/products/${productID}`);
    return response.data;
  },

  create: async (data: CreateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.post('/api/admin/products', data);
    return response.data;
  },

  update: async (productID: string, data: Partial<CreateProductData>): Promise<ApiResponse<Product>> => {
    const response = await api.put(`/api/admin/products/${productID}`, data);
    return response.data;
  },

  delete: async (productID: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/admin/products/${productID}`);
    return response.data;
  },
};

// Order Management
export const orders = {
  getAll: async (params?: PaginationParams & { status?: string }): Promise<ApiResponse<{ orders: Order[]; pagination: PaginationResponse }>> => {
    const response = await api.get('/api/admin/orders', { params });
    return response.data;
  },

  getById: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/api/admin/orders/${orderId}`);
    return response.data;
  },

  updateStatus: async (orderId: string, data: { status: string; location?: string; description?: string }): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/api/admin/orders/${orderId}/status`, data);
    return response.data;
  },
};

// Customer Management
export const customers = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<{ customers: Customer[]; pagination: PaginationResponse }>> => {
    const response = await api.get('/api/admin/customers', { params });
    return response.data;
  },

  getById: async (customerID: string): Promise<ApiResponse<{ customer: Customer; recentOrders: Order[] }>> => {
    const response = await api.get(`/api/admin/customers/${customerID}`);
    return response.data;
  },
};

// Category Management
export const categories = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/api/admin/categories');
    return response.data;
  },

  create: async (data: { name: string; description?: string; image?: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/api/admin/categories', data);
    return response.data;
  },
};