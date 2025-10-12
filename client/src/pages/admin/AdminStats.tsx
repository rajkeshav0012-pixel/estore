import { useState, useEffect } from 'react';
import { dashboard } from '../../services/adminApi';
import { orders as ordersApi, products as productsApi, customers as customersApi } from '../../services/adminApi';
import type { DashboardData } from '../../types';
import Loading from '../../components/ui/Loading';

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  dailyRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  monthlyOrders: number;
  dailyOrders: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminStats() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const fetchDashboardData = async () => {
    try {
      const response = await dashboard.getStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    }
  };

  const fetchFinancialStats = async () => {
    try {
      // Fetch detailed financial statistics
      const [ordersResponse, productsResponse, customersResponse] = await Promise.all([
        ordersApi.getAll({ limit: 100 }),
        productsApi.getAll({ limit: 100, sortBy: 'totalPurchases', sortOrder: 'desc' }),
        customersApi.getAll({ limit: 100, sortBy: 'totalSpent', sortOrder: 'desc' })
      ]);

      if (ordersResponse.success && productsResponse.success && customersResponse.success) {
        const orders = ordersResponse.data.orders;
        // const products = productsResponse.data.products;
        // const customers = customersResponse.data.customers;

        // Calculate financial metrics
        const totalRevenue = orders
          .filter(o => o.paymentStatus === 'completed')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        const dailyOrders = orders.filter(o => 
          new Date(o.orderDate) >= startOfToday && o.paymentStatus === 'completed'
        );
        const monthlyOrders = orders.filter(o => 
          new Date(o.orderDate) >= startOfMonth && o.paymentStatus === 'completed'
        );
        const yearlyOrders = orders.filter(o => 
          new Date(o.orderDate) >= startOfYear && o.paymentStatus === 'completed'
        );

        const dailyRevenue = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Calculate top products by revenue
        const productRevenue = new Map();
        orders.forEach(order => {
          if (order.paymentStatus === 'completed') {
            order.products.forEach(product => {
              const current = productRevenue.get(product.name) || { revenue: 0, quantity: 0 };
              productRevenue.set(product.name, {
                revenue: current.revenue + product.subtotal,
                quantity: current.quantity + product.quantity
              });
            });
          }
        });

        const topProducts = Array.from(productRevenue.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate revenue by month for the last 12 months
        const revenueByMonth = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthOrders = orders.filter(o => {
            const orderDate = new Date(o.orderDate);
            return orderDate >= monthStart && orderDate <= monthEnd && o.paymentStatus === 'completed';
          });
          
          revenueByMonth.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
            orders: monthOrders.length
          });
        }

        setFinancialStats({
          totalRevenue,
          monthlyRevenue,
          yearlyRevenue,
          dailyRevenue,
          averageOrderValue,
          totalOrders: orders.length,
          monthlyOrders: monthlyOrders.length,
          dailyOrders: dailyOrders.length,
          topProducts,
          revenueByMonth
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch financial stats');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchFinancialStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Statistics</h1>
          <p className="text-gray-600">Business performance and financial metrics</p>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Statistics</h1>
          <p className="text-gray-600">Business performance and financial metrics</p>
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="day">Today</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(financialStats?.totalRevenue || 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">All time earnings</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(financialStats?.monthlyRevenue || 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">This month</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-sm font-medium opacity-90">Daily Revenue</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(financialStats?.dailyRevenue || 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">Today</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg text-white p-6">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(financialStats?.averageOrderValue || 0)}
          </p>
          <p className="text-sm opacity-75 mt-1">Per order</p>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold text-xl">{financialStats?.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Orders</span>
              <span className="font-bold text-lg text-green-600">{financialStats?.monthlyOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Orders</span>
              <span className="font-bold text-lg text-blue-600">{financialStats?.dailyOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-bold text-lg text-purple-600">
                {dashboardData ? formatPercentage(dashboardData.stats.totalOrders, dashboardData.stats.totalCustomers) : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Products</span>
              <span className="font-bold text-xl">{dashboardData?.stats.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-bold text-lg text-yellow-600">{dashboardData?.stats.lowStockProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Seller</span>
              <span className="font-bold text-lg text-green-600">
                {financialStats?.topProducts[0]?.name.substring(0, 15) || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-bold text-xl">{dashboardData?.stats.totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Lifetime Value</span>
              <span className="font-bold text-lg text-green-600">
                {dashboardData?.stats.totalCustomers && dashboardData.stats.totalCustomers > 0 
                  ? formatCurrency((financialStats?.totalRevenue || 0) / dashboardData.stats.totalCustomers)
                  : '$0.00'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Customer Rate</span>
              <span className="font-bold text-lg text-purple-600">
                {dashboardData ? formatPercentage(dashboardData.stats.totalOrders - dashboardData.stats.totalCustomers, dashboardData.stats.totalCustomers) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products by Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products by Revenue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financialStats?.topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPercentage(product.revenue, financialStats?.totalRevenue || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Trend (Last 12 Months) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend (Last 12 Months)</h3>
        <div className="space-y-4">
          {financialStats?.revenueByMonth.map((month, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 w-20">{month.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 max-w-md">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        (month.revenue / Math.max(...(financialStats?.revenueByMonth.map(m => m.revenue) || [1]))) * 100,
                        2
                      )}%`
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(month.revenue)}</div>
                <div className="text-xs text-gray-500">{month.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {dashboardData?.stats.monthlyRevenue && dashboardData?.stats.totalRevenue
                ? formatPercentage(dashboardData.stats.monthlyRevenue, dashboardData.stats.totalRevenue)
                : '0%'
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">Monthly Revenue Growth</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {dashboardData?.stats.totalOrders && dashboardData?.stats.totalCustomers
                ? (dashboardData.stats.totalOrders / dashboardData.stats.totalCustomers).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">Orders per Customer</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {dashboardData?.stats.pendingOrders || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending Orders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency((financialStats?.monthlyRevenue || 0) / 30)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Daily Average Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}