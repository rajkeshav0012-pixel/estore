import { useState, useEffect } from 'react';
import { customers as customersApi } from '../../services/adminApi';
import type { Customer } from '../../types';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import Pagination from '../../components/ui/Pagination';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        sortBy,
        sortOrder
      });
      
      if (response.success) {
        setCustomers(response.data.customers);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCustomers(response.data.pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const openCustomerDetails = async (customer: Customer) => {
    try {
      const response = await customersApi.getById(customer.customerID);
      if (response.success) {
        setSelectedCustomer(response.data.customer);
        setCustomerOrders(response.data.recentOrders);
        setShowCustomerModal(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerStatus = (customer: Customer) => {
    const lastOrderDate = customer.lastOrderDate ? new Date(customer.lastOrderDate) : null;
    const daysSinceLastOrder = lastOrderDate 
      ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!lastOrderDate) return { text: 'New', color: 'text-blue-600 bg-blue-100' };
    if (daysSinceLastOrder! < 30) return { text: 'Active', color: 'text-green-600 bg-green-100' };
    if (daysSinceLastOrder! < 90) return { text: 'Inactive', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Dormant', color: 'text-gray-600 bg-gray-100' };
  };

  if (loading && customers.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">View and manage customer information</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600">
            {customers.filter(c => {
              const lastOrderDate = c.lastOrderDate ? new Date(c.lastOrderDate) : null;
              const daysSinceLastOrder = lastOrderDate 
                ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
                : null;
              return daysSinceLastOrder !== null && daysSinceLastOrder < 30;
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-purple-600">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Date Joined</option>
            <option value="name">Name</option>
            <option value="totalOrders">Total Orders</option>
            <option value="totalSpent">Total Spent</option>
            <option value="lastOrderDate">Last Order</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => {
                const status = getCustomerStatus(customer);
                
                return (
                  <tr key={customer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.customerID}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openCustomerDetails(customer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Customer Details Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setSelectedCustomer(null);
          setCustomerOrders([]);
        }}
        title="Customer Details"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Personal Information</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
                  <p><span className="font-medium">Customer ID:</span> {selectedCustomer.customerID}</p>
                  <p><span className="font-medium">Phone:</span> {selectedCustomer.phone}</p>
                  {selectedCustomer.email && (
                    <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                  )}
                  <p><span className="font-medium">Joined:</span> {formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Purchase Summary</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Total Orders:</span> {selectedCustomer.totalOrders}</p>
                  <p><span className="font-medium">Total Spent:</span> ${selectedCustomer.totalSpent.toFixed(2)}</p>
                  <p><span className="font-medium">Average Order:</span> ${selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2) : '0.00'}</p>
                  {selectedCustomer.lastOrderDate && (
                    <p><span className="font-medium">Last Order:</span> {formatDate(selectedCustomer.lastOrderDate)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses */}
            {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Addresses</h4>
                <div className="mt-2 space-y-2">
                  {selectedCustomer.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm capitalize">{address.type}</p>
                          <p className="text-sm text-gray-600">{address.address}</p>
                          {address.city && address.state && (
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                          )}
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {customerOrders.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Recent Orders</h4>
                <div className="mt-2 space-y-2">
                  {customerOrders.map((order, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{order.orderId}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.orderDate)} • ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderStatus === 'delivered' 
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}