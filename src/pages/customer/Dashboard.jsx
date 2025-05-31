import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Package, Heart, User, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { get } = useApi();
  const [dashboardData, setDashboardData] = useState({
    orderCount: 0,
    recentOrders: [],
    pendingOrders: 0,
    wishlistCount: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get stats
        const [ordersRes, wishlistRes] = await Promise.all([
          get('/orders/my-orders'),
          get('/wishlist')
        ]);

        setDashboardData({
          orderCount: ordersRes.data?.length || 0,
          recentOrders: (ordersRes.data || []).slice(0, 3),
          pendingOrders: (ordersRes.data || []).filter(order => 
            order.status === 'pending' || order.status === 'processing'
          ).length,
          wishlistCount: wishlistRes.data?.length || 0,
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

  if (dashboardData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
      
      {/* Welcome message */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="font-medium text-lg mb-2">{t('welcome_back')}, {user?.name || t('customer')}</h2>
        <p className="text-gray-600">{t('dashboard_welcome_message')}</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-primary/10 p-3 rounded-full">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('total_orders')}</h3>
            <p className="text-2xl font-semibold">{dashboardData.orderCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('pending_orders')}</h3>
            <p className="text-2xl font-semibold">{dashboardData.pendingOrders}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div className="bg-red-100 p-3 rounded-full">
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('wishlist')}</h3>
            <p className="text-2xl font-semibold">{dashboardData.wishlistCount}</p>
          </div>
        </div>
        
        <Link to="/account/profile" className="bg-white p-6 rounded-lg shadow-sm flex items-center hover:bg-gray-50 transition-colors">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{t('my_profile')}</h3>
            <p className="text-sm text-primary">{t('view_profile')}</p>
          </div>
        </Link>
      </div>
      
      {/* Recent orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-lg">{t('recent_orders')}</h2>
          <Link to="/account/orders" className="text-primary text-sm hover:underline">
            {t('view_all')}
          </Link>
        </div>
        
        {dashboardData.recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.recentOrders.map(order => (
              <Link 
                key={order.id} 
                to={`/account/orders/${order.id}`}
                className="flex items-center py-4 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
              >
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4 flex-grow">
                  <p className="font-medium">
                    {t('order')} #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                      minimumFractionDigits: 0,
                    }).format(order.total_amount)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
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
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {t('start_shopping')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
