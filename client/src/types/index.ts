// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors: any;
  timestamp: string;
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  storename: string;
  storeaddress: string;
  storelogo: string;
}

export interface AuthResponse {
  storeID: string;
  token: string;
  admin: {
    name: string;
    email: string;
    storename: string;
    storelogo?: string;
  };
}

// Product Types
export interface Product {
  _id: string;
  productID: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStockLevel: number;
  images: string[];
  rating: number;
  totalPurchases: number;
  outofstock: boolean;
  isActive: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  images: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  minStockLevel?: number;
}

// Order Types
export interface OrderProduct {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderId: string;
  products: OrderProduct[];
  totalAmount: number;
  discount: number;
  tax: number;
  shippingCost: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod: 'COD' | 'Card' | 'UPI' | 'NetBanking' | 'Wallet';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string;
  trackingHistory: TrackingUpdate[];
  orderDate: string;
  confirmedDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export interface TrackingUpdate {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

export interface CreateOrderData {
  products: { productID: string; quantity: number }[];
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod?: string;
  notes?: string;
}

// Customer Types
export interface Customer {
  _id: string;
  customerID: string;
  name: string;
  email?: string;
  phone: string;
  addresses: CustomerAddress[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerAddress {
  type: 'home' | 'work' | 'other';
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault: boolean;
}

// Category Types
export interface Category {
  _id: string;
  categoryID: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  productCount?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  todayOrders: number;
  monthlyOrders: number;
  yearlyOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  topProducts: Product[];
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Store Types
export interface StoreInfo {
  name: string;
  address: string;
  logo: string;
  language: string;
  establishedDate: string;
  totalProducts: number;
  totalCategories: number;
}

// Cart Types (for customer interface)
export interface CartItem {
  productID: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}