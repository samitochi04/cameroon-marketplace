import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  Eye,
  ChevronDown,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

const CustomerOrders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest_first');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setError(t('dashboard.user_not_authenticated'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch orders for the current user only
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id) // Ensure user can only see their own orders
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          setError(t('orders.failed_to_load_orders'));
        } else {
          setOrders(data || []);
          setFilteredOrders(data || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(t('orders.failed_to_load_orders'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, t]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.payment_intent_id && order.payment_intent_id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest_first':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest_amount':
          return (b.total_amount || 0) - (a.total_amount || 0);
        case 'lowest_amount':
          return (a.total_amount || 0) - (b.total_amount || 0);
        case 'newest_first':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSortBy('newest_first');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount || 0);
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
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('orders.my_orders')}</h1>
        <p className="text-gray-600">{t('orders.view_track_orders')}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('orders.search_by_order_id')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Toggle for Mobile */}
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            {t('common.filters')}
          </Button>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-4">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{t('orders.all_statuses')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="processing">{t('orders.processing')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest_first">{t('orders.newest_first')}</option>
                <option value="oldest_first">{t('orders.oldest_first')}</option>
                <option value="highest_amount">{t('orders.highest_amount')}</option>
                <option value="lowest_amount">{t('orders.lowest_amount')}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilter || sortBy !== 'newest_first') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                {t('orders.clear_filters')}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('orders.status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">{t('orders.all_statuses')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="processing">{t('orders.processing')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.sort_by')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest_first">{t('orders.newest_first')}</option>
                <option value="oldest_first">{t('orders.oldest_first')}</option>
                <option value="highest_amount">{t('orders.highest_amount')}</option>
                <option value="lowest_amount">{t('orders.lowest_amount')}</option>
              </select>
            </div>

            {(searchQuery || statusFilter || sortBy !== 'newest_first') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                {t('orders.clear_filters')}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? t('orders.no_orders_yet') : t('orders.no_orders_found')}
          </h3>
          <p className="text-gray-600 mb-6">
            {orders.length === 0 
              ? t('orders.no_orders_yet_message')
              : t('orders.no_orders_match_filters')
            }
          </p>
          {orders.length === 0 ? (
            <Button
              as={Link}
              to="/products"
              variant="primary"
            >
              {t('dashboard.start_shopping')}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              {t('orders.clear_filters')}
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {t('orders.order')} #{order.id.slice(-8)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    
                    {order.payment_status && (
                      <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'}>
                        {order.payment_status === 'completed' ? t('paid') : t('orders.payment_pending')}
                      </Badge>
                    )}
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  )}
                </div>

                <div className="mt-4 md:mt-0 md:ml-6">
                  <Button
                    as={Link}
                    to={`/account/orders/${order.id}`}
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    {t('orders.view')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
