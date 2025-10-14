import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Search,
  Store,
  Phone,
  MapPin,
  User,
  LogIn,
  LogOut
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function CustomerLayout() {
  const location = useLocation();
  const { state: cartState } = useCart();
  const { isAuthenticated, isCustomer, customerName, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/store' },
    { name: 'Products', href: '/store' },
    { name: 'About', href: '/store/about' },
    { name: 'Contact', href: '/store/contact' },
  ];

  const customerNavigation = [
    { name: 'My Orders', href: '/store/orders' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/store" className="flex items-center">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  eStore
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && isCustomer && customerNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>

              {/* Authentication */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated && isCustomer ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Hi, {customerName}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/store/signin">
                      <Button variant="ghost" size="sm">
                        <LogIn className="h-4 w-4 mr-1" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/store/signup">
                      <Button variant="outline" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/store/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartState.totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white flex items-center justify-center">
                      {cartState.totalItems}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between px-4">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Customer Navigation */}
                {isAuthenticated && isCustomer && customerNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Authentication */}
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated && isCustomer ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-sm text-gray-700">
                        Hi, {customerName}
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      >
                        <LogOut className="h-4 w-4 mr-2 inline" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/store/signin"
                        className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LogIn className="h-4 w-4 mr-2 inline" />
                        Sign In
                      </Link>
                      <Link
                        to="/store/signup"
                        className="block px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  eStore
                </span>
              </div>
              <p className="mt-4 text-gray-600">
                Your trusted wholesale store for quality products at great prices.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/store" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/store/track" className="text-gray-600 hover:text-gray-900">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/store/orders" className="text-gray-600 hover:text-gray-900">
                    Order History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Contact Info
              </h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  +91-9999999999
                </li>
                <li className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  123 Store Street, City, State
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <p className="text-center text-gray-500">
              © 2024 eStore. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}