import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, CreditCard, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const VendorDashboard = () => {
  const { t } = useTranslation();
  const { get } = useApi();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      productCount: 0,
      publishedProductCount: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalItemsSold: 0
    },
    recentOrders: [],
    topProducts: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get vendor summary statistics
        const [summaryRes, ordersRes, topProductsRes] = await Promise.all([
          get('/analytics/vendor/summary'),
          get('/orders/vendor/items?limit=5'),
          get('/analytics/vendor/top-products')
        ]);

        setDashboardData({
          summary: summaryRes.data || {
            productCount: 0,
            publishedProductCount: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalItemsSold: 0
          },
          recentOrders: ordersRes.data || [],
          topProducts: topProductsRes.data || [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: t('failed_to_load_dashboard_data')
        }));
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

  if (dashboardData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('vendor_dashboard')}</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('products')}</h3>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold">{dashboardData.summary.publishedProductCount}</p>
              <span className="ml-2 text-xs text-gray-500">/ {dashboardData.summary.productCount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-amber-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('orders')}</h3>
            <p className="text-2xl font-semibold">{dashboardData.summary.totalOrders}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('revenue')}</h3>
            <p className="text-2xl font-semibold">
              {formatCurrency(dashboardData.summary.totalRevenue)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg">{t('recent_orders')}</h2>
            <Link to="/vendor-portal/orders" className="text-primary text-sm hover:underline">
              {t('view_all')}
            </Link>
          </div>
          
          {dashboardData.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dashboardData.recentOrders.map(order => (
                <Link 
                  key={order.id} 
                  to={`/vendor-portal/orders/${order.id}`}
                  className="flex items-center py-4 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-medium">
                      {t('order')} #{order.order_id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">
                      {formatCurrency(order.total)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">{t('no_orders_yet')}</h3>
              <p className="text-gray-500 mb-4">{t('no_orders_yet_message')}</p>
            </div>
          )}
        </div>
        
        {/* Top selling products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium text-lg">{t('top_selling_products')}</h2>
            <Link to="/vendor-portal/products" className="text-primary text-sm hover:underline">
              {t('view_all_products')}
            </Link>
          </div>
          
          {dashboardData.topProducts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dashboardData.topProducts.map(product => (
                <Link 
                  key={product.id} 
                  to={`/vendor-portal/products/edit/${product.id}`}
                  className="flex items-center py-4 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
                >
                  <div className="flex-shrink-0">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {t('items_sold')}: {product.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-green-600">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">{t('no_sales_yet')}</h3>
              <p className="text-gray-500 mb-4">{t('no_sales_yet_message')}</p>
              <Link
                to="/vendor-portal/products/new"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
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
