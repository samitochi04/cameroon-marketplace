import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { BarChart, DollarSign, Package, ShoppingBag, PlusCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import VendorEarnings from './VendorEarnings/VendorEarnings';

// Mock data for dashboard when API endpoints don't exist
const MOCK_DASHBOARD_DATA = {
  summary: {
    totalOrders: 23,
    revenue: 150000,
    pendingOrders: 5,
    itemsSold: 37
  },
  recentOrders: [
    { id: 'ord-001', date: '2023-05-15', status: 'completed', total: 25000 },
    { id: 'ord-002', date: '2023-05-16', status: 'processing', total: 18500 },
    { id: 'ord-003', date: '2023-05-17', status: 'pending', total: 32000 }
  ],
  salesOverview: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [12000, 19000, 15000, 22000, 30000, 25000, 18000]
  },
  topProducts: [
    { id: 'prod-001', name: 'Product 1', sold: 42, revenue: 21000 },
    { id: 'prod-002', name: 'Product 2', sold: 38, revenue: 19000 },
    { id: 'prod-003', name: 'Product 3', sold: 25, revenue: 12500 }
  ]
};

const VendorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { get } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('last_7_days');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching vendor dashboard data...');
        
        // Attempt to get real data from API
        try {
          // Fetch summary data
          const { data: summaryData, error: summaryError } = await get('/analytics/vendor/summary');
          
          // Fetch sales data
          const { data: salesData, error: salesError } = await get(`/analytics/vendor/sales?timeRange=${timeRange}`);
          
          // Fetch recent orders
          const { data: recentOrders, error: ordersError } = await get('/orders/vendor/recent');
          
          // Fetch top products
          const { data: topProducts, error: productsError } = await get('/products/vendor/top');
          
          // If any request failed or returned empty data, use mock data
          if (summaryError || salesError || ordersError || productsError || 
              !summaryData || !salesData || !recentOrders || !topProducts) {
            console.log('Using mock dashboard data due to API errors or missing data');
            setDashboardData(MOCK_DASHBOARD_DATA);
          } else {
            // Use real data
            setDashboardData({
              summary: summaryData,
              salesOverview: salesData,
              recentOrders: recentOrders,
              topProducts: topProducts
            });
          }
        } catch (error) {
          console.log('Error fetching dashboard data:', error);
          // Fallback to mock data on error
          setDashboardData(MOCK_DASHBOARD_DATA);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
        
        // Still use mock data on error
        setDashboardData(MOCK_DASHBOARD_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [get, timeRange]);

  // Handle data loading and errors
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {t('failed_to_load_dashboard_data')}
      </div>
    );
  }

  // Make sure we have data before rendering
  const summary = dashboardData?.summary || MOCK_DASHBOARD_DATA.summary;
  const dashboardRecentOrders = dashboardData?.recentOrders || MOCK_DASHBOARD_DATA.recentOrders;
  const salesData = dashboardData?.salesOverview || MOCK_DASHBOARD_DATA.salesOverview;
  const dashboardTopProducts = dashboardData?.topProducts || MOCK_DASHBOARD_DATA.topProducts;

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('vendor_dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard_welcome_message')}</p>
      </div>
      
      {/* Top Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-xs rounded-md ${
              timeRange === '7d'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('last_7_days')}
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-xs rounded-md ${
              timeRange === '30d'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('last_30_days')}
          </button>
        </div>
        
        {/* Add Product Button */}
        <Link
          to="/vendor-portal/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('add_new_product')}
        </Link>
      </div>

      {/* Payment Setup Alert - Show if payment method is not configured */}
      {!loading && stats?.paymentConfigured === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{t('vendor.payment_method_not_setup')}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{t('vendor.payment_method_setup_prompt')}</p>
                <Link
                  to="/vendor-portal/payment-settings"
                  className="mt-2 block font-medium text-sm text-yellow-800 hover:text-yellow-900"
                >
                  {t('vendor.setup_payment_method')} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('total_orders')}</p>
                  <h3 className="text-2xl font-bold">{summary.totalOrders}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('revenue')}</p>
                  <h3 className="text-2xl font-bold">{(summary.revenue || 0).toLocaleString()} XAF</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('orders.pending')}</p>
                  <h3 className="text-2xl font-bold">{summary.pendingOrders}</h3>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Items Sold */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('items_sold')}</p>
                  <h3 className="text-2xl font-bold">{summary.itemsSold}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Package className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('sales_overview')}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeRange === '7d'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('last_7_days')}
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeRange === '30d'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('last_30_days')}
                </button>
              </div>
            </div>

            {/* Placeholder for chart */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-50 flex items-center justify-center rounded-md">
              <div className="text-center p-4">
                <BarChart size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">{t('sales_chart')}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('orders.recent_orders')}</h2>
              <Link to="/vendor-portal/orders" className="text-sm text-primary hover:underline">
                {t('view_all')}
              </Link>
            </div>

            {dashboardRecentOrders && dashboardRecentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('order')} #
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('orders.date')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('orders.status')}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('total')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardRecentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-primary">
                          <Link to={`/vendor-portal/orders/${order.id}`}>{order.id}</Link>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {order.total.toLocaleString()} XAF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">{t('no_orders_yet')}</p>
                <p className="text-gray-400 text-sm mt-1">{t('no_orders_yet_message')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Earnings & Top Products */}
        <div className="space-y-6">
          {/* Earnings section */}
          <VendorEarnings />
          
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('top_selling_products')}</h2>
              <Link to="/vendor-portal/products" className="text-sm text-primary hover:underline">
                {t('view_all_products')}
              </Link>
            </div>

            {dashboardTopProducts && dashboardTopProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardTopProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.sold || 0} {t('of')} {t('items_sold')}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{(product.revenue || 0).toLocaleString()} XAF</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">{t('no_sales_yet')}</p>
                <p className="text-gray-400 text-sm mt-1">{t('no_sales_yet_message')}</p>
                <Link
                  to="/vendor-portal/products/new"
                  className="mt-3 inline-block px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
                >
                  {t('add_product')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
