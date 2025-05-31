import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Search, Filter, ChevronDown, ShoppingBag } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const CustomerOrders = () => {
  const { t } = useTranslation();
  const { get } = useApi();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await get('/orders/my-orders');
        setOrders(response.data || []);
        setFilteredOrders(response.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(t('failed_to_load_orders'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [get, t]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(order => order.status === filterStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'amount-asc':
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case 'amount-desc':
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
      default:
        break;
    }
    
    setFilteredOrders(result);
  }, [orders, filterStatus, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          {t('try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('my_orders')}</h1>
        
        <div className="mt-4 md:mt-0">
          <Link 
            to="/products"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            {t('continue_shopping')}
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('search_by_order_id')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
          
          {/* Sort by */}
          <div className="relative min-w-[180px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date-desc">{t('newest_first')}</option>
              <option value="date-asc">{t('oldest_first')}</option>
              <option value="amount-desc">{t('highest_amount')}</option>
              <option value="amount-asc">{t('lowest_amount')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('order_id')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('total')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/account/orders/${order.id}`} className="text-primary hover:text-primary-dark">
                        {t('view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">{t('no_orders_found')}</h3>
          <p className="text-gray-500 mb-4">{t('no_orders_match_filters')}</p>
          {filterStatus !== 'all' || searchTerm ? (
            <button 
              onClick={() => {
                setFilterStatus('all');
                setSearchTerm('');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              {t('clear_filters')}
            </button>
          ) : (
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {t('start_shopping')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
