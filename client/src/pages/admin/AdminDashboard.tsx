import { useEffect, useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { dashboard } from '../../services/adminApi';
import type { DashboardData } from '../../types';
import Loading from '../../components/ui/Loading';
import { formatCurrency } from '../../lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboard.getStats();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const stats = [
    {
      name: 'Total Revenue',
      value: formatCurrency(data.stats.totalRevenue),
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Total Orders',
      value: data.stats.totalOrders.toString(),
      change: `+${data.stats.todayOrders} today`,
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      name: 'Total Products',
      value: data.stats.totalProducts.toString(),
      change: `${data.stats.lowStockProducts} low stock`,
      changeType: data.stats.lowStockProducts > 0 ? 'negative' : 'neutral',
      icon: Package,
    },
    {
      name: 'Total Customers',
      value: data.stats.totalCustomers.toString(),
      change: '+5% this month',
      changeType: 'positive',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className={`text-sm ${
                stat.changeType === 'positive' 
                  ? 'text-green-600' 
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y">
            {data.recentOrders.map((order) => (
              <div key={order.orderId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className={`text-xs ${
                      order.orderStatus === 'delivered' 
                        ? 'text-green-600' 
                        : order.orderStatus === 'pending'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    }`}>
                      {order.orderStatus}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
          </div>
          <div className="divide-y">
            {data.topProducts.map((product) => (
              <div key={product.productID} className="px-6 py-4">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-lg object-cover"
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.totalPurchases} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {data.stats.lowStockProducts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have {data.stats.lowStockProducts} products with low stock levels.
                Consider restocking soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}