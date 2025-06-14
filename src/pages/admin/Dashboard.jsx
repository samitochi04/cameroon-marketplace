import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { get } = useApi();
  const [stats, setStats] = useState({
    userCount: 0,
    vendorCount: 0,
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    pendingVendors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch summary statistics
        const [summaryRes, ordersRes, salesRes] = await Promise.all([
          get('/analytics/platform/summary'),
          get('/orders?limit=5'),
          get('/analytics/platform/sales?period=30d')
        ]);

        setStats(summaryRes.data || {
          userCount: 0,
          vendorCount: 0,
          productCount: 0,
          orderCount: 0,
          revenue: 0,
          pendingVendors: 0
        });

        setRecentOrders(ordersRes.data || []);
        setSalesData(salesRes.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(t('error_loading_dashboard'));
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [get, t]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('users')}</h3>
            <p className="text-2xl font-semibold">{stats.userCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-amber-100 p-3 rounded-full">
            <Store className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('vendors')}</h3>
            <p className="text-2xl font-semibold">{stats.vendorCount}</p>
            {stats.pendingVendors > 0 && (
              <p className="text-xs text-amber-600">
                {stats.pendingVendors} {t('pending_approval')}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-purple-100 p-3 rounded-full">
            <ShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('products')}</h3>
            <p className="text-2xl font-semibold">{stats.productCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('total_revenue')}</h3>
            <p className="text-2xl font-semibold">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
      </div>
      
      {/* Sales Chart and Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
              {t('sales_last_30_days')}
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            {salesData.length > 0 ? (
              <div className="w-full h-full">
                {/* Placeholder for the chart - in a real app, use a chart library */}
                <div className="bg-gray-100 w-full h-full rounded flex items-center justify-center">
                  <BarChart3 className="h-10 w-10 text-gray-400" />
                  <span className="ml-2 text-gray-500">{t('sales_chart')}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{t('no_sales_data')}</p>
            )}
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg">{t('recent_orders')}</h2>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="p-3 hover:bg-gray-50 rounded-md transition-colors">
                  <div className="flex justify-between">
                    <p className="font-medium">#{order.id.slice(0, 8)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(order.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {formatCurrency(order.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('no_recent_orders')}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Categories and Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-gray-500" />
              {t('product_categories')}
            </h2>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            {/* Placeholder for the chart - in a real app, use a chart library */}
            <div className="bg-gray-100 w-full h-full rounded flex items-center justify-center">
              <PieChart className="h-10 w-10 text-gray-400" />
              <span className="ml-2 text-gray-500">{t('categories_chart')}</span>
            </div>
          </div>
        </div>
        
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg">{t('top_selling_products')}</h2>
          </div>
          
          <div className="space-y-3">
            {/* Sample data - replace with actual API data */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                <div className="h-10 w-10 bg-gray-200 rounded-md flex-shrink-0"></div>
                <div className="ml-3 flex-grow">
                  <p className="font-medium">{t('product')} {i}</p>
                  <p className="text-sm text-gray-500">{t('category')} {i % 3 + 1}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(1000 * i)}</p>
                  <p className="text-sm text-gray-500">{10 * i} {t('sold')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
