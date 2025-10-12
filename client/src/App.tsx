import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignUp from './pages/admin/AdminSignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import AdminStats from './pages/admin/AdminStats';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import CustomerSignIn from './pages/customer/CustomerSignIn';
import CustomerSignUp from './pages/customer/CustomerSignUp';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import MyOrders from './pages/customer/MyOrders';
import OrderHistory from './pages/customer/OrderHistory';

// Layout Components
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Landing page redirect */}
            <Route path="/" element={<Navigate to="/store" replace />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignUp />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="stats" element={<AdminStats />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/store/signin" element={<CustomerSignIn />} />
            <Route path="/store/signup" element={<CustomerSignUp />} />
            <Route path="/store" element={<CustomerLayout />}>
              <Route index element={<CustomerHome />} />
              <Route path="product/:productID" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="track/:orderId" element={<OrderTracking />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:phone" element={<OrderHistory />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/store" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
