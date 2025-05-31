import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Package, 
  AlertTriangle, 
  ArrowDownUp
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const VendorOrders = () => {
  const { t } = useTranslation();
  const { get } = useApi();
  const [orderItems, setOrderItems] = useState([]);
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        setIsLoading(true);
        const response = await get('/orders/vendor/items');
        setOrderItems(response.data || []);
        setFilteredOrderItems(response.data || []);
      } catch (error) {
        console.error('Error fetching order items:', error);
        setError(t('failed_to_load_orders'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderItems();
  }, [get, t]);

  // Filter order items
  useEffect(() => {
    let result = [...orderItems];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.product?.name && item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      case 'price-asc':
        result.sort((a, b) => a.total - b.total);
        break;
      case 'price-desc':
        result.sort((a, b) => b.total - a.total);
        break;
      default:
        break;
    }
    
    setFilteredOrderItems(result);
  }, [orderItems, statusFilter, searchTerm, sortBy]);

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">{t('error_occurred')}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          {t('try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('orders')}</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('search_orders')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="processing">{t('processing')}</option>
              <option value="shipped">{t('shipped')}</option>
              <option value="delivered">{t('delivered')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
          
          {/* Sort by */}
          <div className="relative min-w-[180px]">
            <ArrowDownUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="date-desc">{t('newest_first')}</option>
              <option value="date-asc">{t('oldest_first')}</option>
              <option value="price-desc">{t('highest_amount')}</option>
              <option value="price-asc">{t('lowest_amount')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {/* Order items list */}
      {filteredOrderItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('order')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('quantity')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{item.order_id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product?.image ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || t('unknown_product')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        item.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/vendor-portal/orders/${item.order_id}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        {t('view_details')}
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
          {statusFilter !== 'all' || searchTerm ? (
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              {t('clear_filters')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
