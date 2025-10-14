import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';

export default function Cart() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { items, totalAmount, totalItems } = state;
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setLoading(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setLoading(productId);
    try {
      await removeItem(productId);
    } finally {
      setLoading(null);
    }
  };

  const handleClearCart = async () => {
    setLoading('clear');
    try {
      await clearCart();
    } finally {
      setLoading(null);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/store/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">
            Looks like you haven't added anything to your cart yet.
          </p>
          <div className="mt-6">
            <Link to="/store">
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center mb-8">
        <Link to="/store" className="mr-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart ({totalItems} items)
        </h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Cart Items */}
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-6 sm:px-6">
              <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.productID} className="py-6 flex">
                      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                        <img
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-center object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <div className="pr-6">
                              <h3 className="text-sm">
                                <Link
                                  to={`/store/product/${item.productID}`}
                                  className="font-medium text-gray-700 hover:text-gray-800"
                                >
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            <div className="flex">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveItem(item.productID)}
                                loading={loading === item.productID}
                                className="text-red-600 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productID, item.quantity - 1)}
                                disabled={item.quantity <= 1 || loading === item.productID}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="mx-2 text-gray-900 font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.productID, item.quantity + 1)}
                                disabled={loading === item.productID}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              Subtotal: {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  loading={loading === 'clear'}
                  className="text-red-600 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
                <p className="text-sm text-gray-600">
                  {totalItems} items in cart
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-6 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-900">
                    Free
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-900">
                    Calculated at checkout
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900">Order total</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>

              <div className="mt-4">
                <Link to="/store">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Secure checkout powered by SSL encryption
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Free Shipping</h3>
            <p className="mt-1 text-sm text-blue-700">
              Free delivery on all orders. No minimum purchase required.
            </p>
          </div>

          {/* Return Policy */}
          <div className="mt-4 bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Return Policy</h3>
            <p className="mt-1 text-sm text-green-700">
              30-day return policy. Items must be in original condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}