import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { customerOrders } from '../../services/customerApi';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import { formatCurrency } from '../../lib/utils';
import type { Order } from '../../types';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if this is a redirect from successful order placement
  const { orderPlaced, estimatedDelivery } = location.state || {};

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // We need phone number for the API call, but for now let's try the track method
      // In a real app, we'd get the phone from user context or have a different API
      const response = await customerOrders.track(orderId!);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
      case 'returned':
        return <Package className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'confirmed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled':
      case 'returned':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: CheckCircle },
      { status: 'processing', label: 'Processing', icon: Package },
      { status: 'shipped', label: 'Shipped', icon: Truck },
      { status: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus.toLowerCase());

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="bg-red-50 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Order Not Found</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link to="/store">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Success Message for New Orders */}
      {orderPlaced && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">Order Placed Successfully!</h2>
              <p className="text-green-700">
                Your order has been confirmed and will be delivered soon.
              </p>
              {estimatedDelivery && (
                <p className="text-sm text-green-600 mt-1">
                  Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order?.orderId || orderId}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {order ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {order && (
              <div className={`mt-4 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                {getStatusIcon(order.orderStatus)}
                <span className="ml-2">{order.orderStatus}</span>
              </div>
            )}
          </div>
        </div>

        {order && (
          <>
            {/* Order Progress */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h3>
              <div className="flex items-center justify-between">
                {getStatusSteps(order.orderStatus).map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.completed
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : step.current
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < getStatusSteps(order.orderStatus).length - 1 && (
                      <div className={`absolute w-full h-0.5 top-6 left-1/2 transform -translate-x-1/2 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} style={{ width: 'calc(100% - 3rem)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-20">Name:</span>
                      <span className="text-gray-900">{order.customerName}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{order.customerPhone}</span>
                    </div>
                    {order.customerEmail && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{order.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-900">{order.shippingAddress}</span>
                    </div>
                    {order.estimatedDeliveryDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">
                          Est. delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.products.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <div className="text-sm text-gray-600">Payment: {order.paymentMethod}</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Order Notes</h4>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="px-6 py-6 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
            <Link to="/store">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <div className="flex space-x-3">
              {order?.orderStatus === 'delivered' && (
                <Button variant="outline">Leave Review</Button>
              )}
              {order?.orderStatus !== 'cancelled' && order?.orderStatus !== 'delivered' && (
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  Cancel Order
                </Button>
              )}
              <Button onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}