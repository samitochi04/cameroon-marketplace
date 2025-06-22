import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package,
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setError(t('dashboard.user_not_authenticated'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          setError(t('dashboard.failed_to_load_orders'));
        } else {
          setOrders(ordersData || []);
          
          // Calculate stats
          const totalOrders = ordersData?.length || 0;
          const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
          const completedOrders = ordersData?.filter(order => order.status === 'completed').length || 0;
          const totalSpent = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          
          setStats({
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSpent
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(t('dashboard.failed_to_load_data'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, t]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return t('orders.completed');
      case 'pending':
        return t('orders.pending');
      case 'cancelled':
        return t('orders.cancelled');
      case 'processing':
        return t('orders.processing');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {t('dashboard.welcome_back')}, {user?.name || user?.email || t('dashboard.customer')}!
        </h1>
        <p className="text-gray-600">
          {t('dashboard.dashboard_welcome_message')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.total_orders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.pending_orders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.completed_orders')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('dashboard.total_spent')}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{t('dashboard.recent_orders')}</h2>
              <Button
                as={Link}
                to="/account/orders"
                variant="outline"
                size="sm"
              >
                {t('dashboard.view_all_orders')}
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('dashboard.no_orders_yet')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('dashboard.no_orders_yet_message')}
                </p>
                <Button
                  as={Link}
                  to="/products"
                  variant="primary"
                >
                  {t('dashboard.start_shopping')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {t('orders.order')} #{order.id.slice(-8)}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        <Button
                          as={Link}
                          to={`/account/orders/${order.id}`}
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="h-4 w-4" />}
                        >
                          {t('orders.view')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Profile Summary */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('dashboard.profile_summary')}</h3>
              <Button
                as={Link}
                to="/account/profile"
                variant="outline"
                size="sm"
                leftIcon={<User className="h-4 w-4" />}
              >
                {t('dashboard.edit_profile')}
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">{t('profile.name')}</p>
                <p className="font-medium">{user?.name || t('dashboard.not_provided')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t('profile.email')}</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t('profile.phone_number')}</p>
                <p className="font-medium">{user?.phonenumber || t('dashboard.not_provided')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.member_since')}</p>
                <p className="font-medium">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString()
                    : t('dashboard.not_available')
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.quick_actions')}</h3>
            
            <div className="space-y-3">
              <Button
                as={Link}
                to="/products"
                variant="primary"
                className="w-full justify-start"
                leftIcon={<ShoppingBag className="h-4 w-4" />}
              >
                {t('dashboard.browse_products')}
              </Button>
              
              <Button
                as={Link}
                to="/account/orders"
                variant="outline"
                className="w-full justify-start"
                leftIcon={<Package className="h-4 w-4" />}
              >
                {t('dashboard.view_orders')}
              </Button>
              
              <Button
                as={Link}
                to="/account/profile"
                variant="outline"
                className="w-full justify-start"
                leftIcon={<User className="h-4 w-4" />}
              >
                {t('dashboard.update_profile')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
