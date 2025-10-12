import { useState, useEffect } from 'react';
import { orders as ordersApi } from '../../services/adminApi';
import type { Order } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800' }
];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusDescription, setStatusDescription] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll({
        page: currentPage,
        limit: 15,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder
      });
      
      if (response.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, selectedStatus, sortBy, sortOrder]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      const response = await ordersApi.updateStatus(selectedOrder.orderId, {
        status: newStatus,
        location: statusLocation,
        description: statusDescription
      });
      
      if (response.success) {
        setShowTrackingModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        setStatusLocation('');
        setStatusDescription('');
        fetchOrders();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowTrackingModal(true);
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecentOrders = () => {
    return orders.slice(0, 15);
  };

  if (loading && orders.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage customer orders and tracking</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.orderStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Shipped Orders</h3>
          <p className="text-2xl font-bold text-indigo-600">
            {orders.filter(o => o.orderStatus === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="orderDate">Order Date</option>
            <option value="totalAmount">Total Amount</option>
            <option value="orderStatus">Status</option>
            <option value="customerName">Customer Name</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Orders (Last 15)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getRecentOrders().map((order) => {
                const statusInfo = getStatusInfo(order.orderStatus);
                
                return (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">Track: {order.trackingNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.paymentStatus === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openTrackingModal(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Track
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Show More Button */}
        {totalOrders > 15 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <Button
              variant="secondary"
              onClick={() => {
                // Load more orders functionality
                setCurrentPage(currentPage + 1);
              }}
            >
              Load More Orders
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Order Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Order ID:</span> {selectedOrder.orderId}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.orderDate)}</p>
                  <p><span className="font-medium">Status:</span> {getStatusInfo(selectedOrder.orderStatus).label}</p>
                  <p><span className="font-medium">Payment:</span> {selectedOrder.paymentStatus}</p>
                  {selectedOrder.trackingNumber && (
                    <p><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Customer Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                  {selectedOrder.customerEmail && (
                    <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Shipping Address</h4>
              <p className="mt-1 text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Order Items</h4>
              <div className="mt-2 space-y-2">
                {selectedOrder.products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {product.quantity} × ${product.price}</p>
                    </div>
                    <p className="font-medium">${product.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Tracking History</h4>
                <div className="mt-2 space-y-2">
                  {selectedOrder.trackingHistory.map((track, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{track.status}</p>
                          <p className="text-sm text-gray-600">{track.description}</p>
                          {track.location && (
                            <p className="text-sm text-gray-500">Location: {track.location}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(track.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Tracking Update Modal */}
      <Modal
        isOpen={showTrackingModal}
        onClose={() => {
          setShowTrackingModal(false);
          setSelectedOrder(null);
          setNewStatus('');
          setStatusLocation('');
          setStatusDescription('');
        }}
        title="Update Order Status"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Current Status: <span className="font-medium">{getStatusInfo(selectedOrder.orderStatus).label}</span>
              </p>
              <p className="text-sm text-gray-600">
                Order ID: {selectedOrder.orderId} - {selectedOrder.customerName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Location (Optional)"
              value={statusLocation}
              onChange={(e) => setStatusLocation(e.target.value)}
              placeholder="e.g., Distribution Center, Local Hub"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
                placeholder="Additional details about the status update..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowTrackingModal(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                  setStatusLocation('');
                  setStatusDescription('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate}>
                Update Status
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}