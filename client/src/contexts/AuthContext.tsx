import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { adminAuth } from '../services/adminApi';
import { customerAuth } from '../services/customerApi';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  adminName: string;
  customerName: string;
  customerPhone: string;
  token: string | null;
  login: (username: string, password: string, userType?: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    console.log('🔐 Auth: Checking login status...');
    
    // Check for admin session
    const adminToken = localStorage.getItem('admin_token');
    const adminUserName = localStorage.getItem('admin_name');
    
    // Check for customer session
    const customerToken = localStorage.getItem('customer_token');
    const custName = localStorage.getItem('customer_name');
    const custPhone = localStorage.getItem('customer_phone');
    
    if (adminToken && adminUserName) {
      console.log('✅ Found saved admin session');
      setToken(adminToken);
      setAdminName(adminUserName);
      setIsAuthenticated(true);
      setIsAdmin(true);
      setIsCustomer(false);
    } else if (customerToken && custName && custPhone) {
      console.log('✅ Found saved customer session');
      setToken(customerToken);
      setCustomerName(custName);
      setCustomerPhone(custPhone);
      setIsAuthenticated(true);
      setIsAdmin(false);
      setIsCustomer(true);
    } else {
      console.log('❌ No saved session found');
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, userType: 'admin' | 'customer' = 'admin') => {
    console.log(`🔐 Starting ${userType} login...`);
    
    try {
      if (userType === 'admin') {
        const response = await adminAuth.signin({ username, password });
        console.log('🔐 Admin login response:', response);
          
        if (response.success && response.data) {
          const { token: authToken, admin } = response.data;
          
          if (authToken && admin && admin.name) {
            console.log('✅ Admin login successful, saving session...');
            
            // Clear any customer session
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_name');
            localStorage.removeItem('customer_phone');
            
            // Save admin session
            localStorage.setItem('admin_token', authToken);
            localStorage.setItem('admin_name', admin.name);
            
            // Update state
            setToken(authToken);
            setAdminName(admin.name);
            setCustomerName('');
            setCustomerPhone('');
            setIsAuthenticated(true);
            setIsAdmin(true);
            setIsCustomer(false);
            
            console.log('✅ Admin logged in successfully');
          } else {
            throw new Error('Invalid admin login response');
          }
        } else {
          throw new Error(response.message || 'Admin login failed');
        }
      } else {
        // Customer login
        const response = await customerAuth.signIn(username, password);
        console.log('🔐 Customer login response:', response);
          
        if (response.success && response.data) {
          const { token: authToken, customer } = response.data;
          
          if (authToken && customer && customer.name) {
            console.log('✅ Customer login successful, saving session...');
            
            // Clear any admin session
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_name');
            
            // Save customer session
            localStorage.setItem('customer_token', authToken);
            localStorage.setItem('customer_name', customer.name);
            localStorage.setItem('customer_phone', customer.phone);
            
            // Update state
            setToken(authToken);
            setCustomerName(customer.name);
            setCustomerPhone(customer.phone);
            setAdminName('');
            setIsAuthenticated(true);
            setIsAdmin(false);
            setIsCustomer(true);
            
            console.log('✅ Customer logged in successfully');
          } else {
            throw new Error('Invalid customer login response');
          }
        } else {
          throw new Error(response.message || 'Customer login failed');
        }
      }
    } catch (error: any) {
      console.error(`❌ ${userType} login error:`, error);
      throw new Error(error.message || `${userType} login failed`);
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    
    // Clear all localStorage items
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_phone');
    
    // Clear all state
    setToken(null);
    setAdminName('');
    setCustomerName('');
    setCustomerPhone('');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsCustomer(false);
    
    console.log('✅ Logged out successfully');
  };

  const value: AuthContextType = {
    isAuthenticated,
    isAdmin,
    isCustomer,
    adminName,
    customerName,
    customerPhone,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}