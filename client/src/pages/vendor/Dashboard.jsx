import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { BarChart, DollarSign, Package, ShoppingBag, PlusCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import VendorEarnings from '@/components/vendor/VendorEarnings';

const VendorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    itemsSold: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch vendor profile to check payment setup
      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('has_payment_setup, mobile_money_accounts, balance, total_earnings')
          .eq('id', user.id)
          .single();
        
        if (vendorError) {
          console.error('Error fetching vendor profile:', vendorError);
        } else {
          setVendorProfile(vendorData);
        }
      } catch (vendorErr) {
        console.error('Error fetching vendor profile:', vendorErr);
      }
      
      // Initialize chart data with monthly labels
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const initialChartData = months.map(month => ({
        label: month,
        sales: 0,
        orders: 0
      }));
      
      // Set the initial chart data
      setSalesChartData(initialChartData);
      
      // Create a simple chart visualization with random data
      // We'll replace this with actual data below when processing orders

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Fetch order items for the vendor with products
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          total,
          status,
          created_at,
          orders:order_items_order_id_fkey (
            id,
            user_id,
            status,
            total_amount,
            payment_status,
            created_at
          ),
          products:order_items_product_id_fkey (
            id,
            name,
            price,
            sale_price,
            images
          )
        `)
        .eq('vendor_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        throw orderItemsError;
      }

      // Fetch all-time order items for total counts
      const { data: allOrderItemsData, error: allOrderItemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          status,
          total,
          created_at,
          order_id,
          price,
          quantity
        `)
        .eq('vendor_id', user.id);

      if (allOrderItemsError) {
        console.error('Error fetching all order items:', allOrderItemsError);
        throw allOrderItemsError;
      }

      // Fetch payouts data for revenue calculation
      const { data: payoutData, error: payoutError } = await supabase
        .from('vendor_payouts')
        .select(`
          id,
          amount,
          status,
          created_at
        `)
        .eq('vendor_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (payoutError) {
        console.error('Error fetching payout data:', payoutError);
      }

      // Calculate order metrics from order items
      // Group order items by order ID to get unique orders
      const uniqueOrdersMap = new Map();
      
      orderItemsData.forEach(item => {
        if (item.orders) {
          uniqueOrdersMap.set(item.orders.id, item.orders);
        }
      });
      
      // Count items with non-pending status as "sold"
      const itemsSold = orderItemsData
        .filter(item => item.status !== 'pending')
        .reduce((sum, item) => sum + item.quantity, 0);
      
      // Calculate revenue based on completed payouts
      const revenue = payoutData
        ?.filter(payout => payout.status === 'completed')
        .reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;
      
      // Count pending orders from unique orders where status is pending
      const pendingOrders = Array.from(uniqueOrdersMap.values())
        .filter(order => order.status === 'pending')
        .length;

      const totalOrders = uniqueOrdersMap.size;
      
      // Update chart data with actual monthly sales data
      const monthlyData = initialChartData.slice(); // Clone the initial data
      
      // Group sales data by month
      orderItemsData.forEach(item => {
        if (item.total && item.created_at) {
          const date = new Date(item.created_at);
          const monthIndex = date.getMonth();
          
          // Update monthly sales and order count
          monthlyData[monthIndex].sales += (item.total || 0);
          monthlyData[monthIndex].orders += 1;
        }
      });
      
      setSalesChartData(monthlyData);

      // Get recent orders with more details (last 5)
      const uniqueOrders = Array.from(uniqueOrdersMap.values());
      const recentOrdersList = uniqueOrders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(order => {
          // Find all order items for this order
          const orderItems = orderItemsData.filter(item => item.order_id === order.id);
          
          return {
            id: order.id,
            date: order.created_at,
            status: order.status,
            total: order.total_amount,
            payment_status: order.payment_status,
            items: orderItems.length,
            customer_id: order.user_id
          };
        });

      // Calculate top products by calculating total sold quantity per product
      const productSales = {};
      orderItemsData.forEach(item => {
        if (!item.product_id) return;
        
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            id: item.product_id,
            name: item.products?.name || 'Unknown Product',
            image: item.products?.images?.[0] || null,
            sold: 0,
            revenue: 0
          };
        }
        
        productSales[item.product_id].sold += item.quantity || 0;
        productSales[item.product_id].revenue += item.total || 0;
      });
      
      const topProductsList = Object.values(productSales)
        .filter(product => product.sold > 0)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setDashboardData({
        totalOrders,
        revenue,
        pendingOrders,
        itemsSold
      });

      setRecentOrders(recentOrdersList);
      setTopProducts(topProductsList);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
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

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('vendor.dashboard.vendor_dashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('vendor.dashboard.dashboard_welcome_message')}</p>
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
            {t('vendor.dashboard.last_7_days')}
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-xs rounded-md ${
              timeRange === '30d'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {t('vendor.dashboard.last_30_days')}
          </button>
        </div>
        
        {/* Add Product Button */}
        <Link
          to="/vendor-portal/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('vendor.dashboard.add_new_product')}
        </Link>
      </div>      {/* Payment Setup Alert - Show if payment method is not configured */}
      {!loading && vendorProfile && !vendorProfile.has_payment_setup && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{t('vendor.payment_method_not_setup')}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{t('vendor.payment_method_setup_prompt')}</p>
                <Link
                  to="/vendor-portal/settings"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">            {/* Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t('vendor.dashboard.total_orders')}</p>
                  <h3 className="text-2xl font-bold">{dashboardData.totalOrders}</h3>
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
                  <p className="text-sm text-gray-500">{t('vendor.dashboard.revenue')}</p>
                  <h3 className="text-2xl font-bold">{(dashboardData.revenue || 0).toLocaleString()} XAF</h3>
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
                  <p className="text-sm text-gray-500">{t('vendor.dashboard.pending')}</p>
                  <h3 className="text-2xl font-bold">{dashboardData.pendingOrders}</h3>
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
                  <p className="text-sm text-gray-500">{t('vendor.dashboard.items_sold')}</p>
                  <h3 className="text-2xl font-bold">{dashboardData.itemsSold}</h3>
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
              <h2 className="text-lg font-semibold">{t('vendor.dashboard.sales_overview')}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeRange === '7d'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('vendor.dashboard.last_7_days')}
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 text-xs rounded-md ${
                    timeRange === '30d'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t('vendor.dashboard.last_30_days')}
                </button>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="h-64 w-full">
              {recentOrders.length > 0 ? (
                <div className="grid grid-cols-12 h-full gap-1">
                  {salesChartData.map((month, index) => {
                    const height = month.sales > 0 ? `${(month.sales / Math.max(...salesChartData.map(m => m.sales))) * 100}%` : '4%';
                    const currentMonth = new Date().getMonth();
                    const isCurrentMonth = index === currentMonth;
                    
                    return (
                      <div key={month.label} className="flex flex-col items-center justify-end">
                        <div 
                          className={`w-full ${isCurrentMonth ? 'bg-primary' : 'bg-primary/60'} rounded-t`} 
                          style={{ height }}
                          title={`${month.label}: ${month.sales.toLocaleString()} XAF (${month.orders} orders)`}
                        ></div>
                        <span className="text-xs mt-1 text-gray-500">{month.label.substring(0, 1)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 h-full flex flex-col items-center justify-center">
                  <BarChart size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">{t('vendor.dashboard.no_sales_data')}</p>
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('vendor.dashboard.recent_orders')}</h2>
              <Link to="/vendor-portal/orders" className="text-sm text-primary hover:underline">
                {t('vendor.dashboard.view_all')}
              </Link>
            </div>            {recentOrders && recentOrders.length > 0 ? (
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
                    {recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-primary">
                          <Link to={`/vendor-portal/orders/${order.id}`}>{order.id.slice(-8)}</Link>
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
              <h2 className="text-lg font-semibold">{t('vendor.dashboard.top_selling_products')}</h2>
              <Link to="/vendor-portal/products" className="text-sm text-primary hover:underline">
                {t('vendor.dashboard.view_all_products')}
              </Link>
            </div>            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product) => (
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
  );
};

export default VendorDashboard;