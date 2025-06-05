import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Package,
  Eye
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

// Mock data to use when real data is not available
const MOCK_ORDERS = [
  {
    id: "order-123",
    order_number: "ORD-123456",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    customer: { name: "John Doe" },
    total_amount: 125.99,
    status: "processing",
    items_count: 3,
    items: [
      { 
        product: { name: "Product 1" },
        quantity: 2,
        price: 45.99
      },
      { 
        product: { name: "Product 2" },
        quantity: 1,
        price: 34.01
      }
    ]
  },
  {
    id: "order-124",
    order_number: "ORD-123457",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    customer: { name: "Jane Smith" },
    total_amount: 89.99,
    status: "pending",
    items_count: 1,
    items: [
      { 
        product: { name: "Product 3" },
        quantity: 1,
        price: 89.99
      }
    ]
  }
];

const VendorOrders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Get vendor's products first to identify their products in order items
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('vendor_id', user.id);
        
        if (productsError) throw productsError;
        
        if (!products || products.length === 0) {
          // No products, so no orders
          setOrders([]);
          setFilteredOrders([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        const productIds = products.map(p => p.id);
        
        // Modified query - split into two parts to avoid relationship error
        // First get the order items
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            product_id,
            quantity,
            price,
            total,
            status
          `)
          .in('product_id', productIds)
          .order('created_at', { ascending: false });
        
        if (orderItemsError) throw orderItemsError;
        
        if (!orderItems || orderItems.length === 0) {
          setOrders([]);
          setFilteredOrders([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        // Get unique order IDs
        const orderIds = [...new Set(orderItems.map(item => item.order_id))];
        
        // Then fetch orders separately
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id, 
            order_number,
            user_id, 
            status, 
            total_amount, 
            created_at
          `)
          .in('id', orderIds);
        
        if (ordersError) throw ordersError;
        
        // Then fetch user info for the orders
        const userIds = [...new Set(ordersData.map(order => order.user_id))];
        const { data: usersData, error: usersError } = await supabase
          .from('profiles') // Using profiles table instead of users
          .select('id, name, email')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Create a map of users for easy lookup
        const usersMap = usersData?.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {}) || {};
        
        // Create a map of orders for easy lookup
        const ordersMap = ordersData?.reduce((acc, order) => {
          acc[order.id] = {
            ...order,
            user: usersMap[order.user_id] || { name: "Unknown Customer" }
          };
          return acc;
        }, {}) || {};
        
        // Group by order
        const vendorOrdersMap = {};
        
        orderItems.forEach(item => {
          const order = ordersMap[item.order_id];
          if (!order) return; // Skip if order not found
          
          const orderId = item.order_id;
          
          if (!vendorOrdersMap[orderId]) {
            vendorOrdersMap[orderId] = {
              id: order.id,
              order_number: order.order_number,
              created_at: order.created_at,
              customer: {
                name: order.user?.name || "Unknown Customer",
                email: order.user?.email
              },
              total_amount: 0, // Will calculate vendor's portion
              status: order.status,
              items_count: 0,
              items: []
            };
          }
          
          // Add this item
          vendorOrdersMap[orderId].items.push({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            status: item.status
          });
          
          // Update order summary
          vendorOrdersMap[orderId].items_count += item.quantity;
          vendorOrdersMap[orderId].total_amount += item.total;
        });
        
        // Convert map to array
        const vendorOrdersArray = Object.values(vendorOrdersMap);
        
        setOrders(vendorOrdersArray);
        setTotalPages(Math.ceil(vendorOrdersArray.length / ITEMS_PER_PAGE));
        
        // Let the filter effect handle filtering
      } catch (err) {
        console.error('Error fetching vendor orders:', err);
        setError(t('orders.failed_to_load_orders'));
        
        // Use mock data in case of error
        setOrders(MOCK_ORDERS);
        setFilteredOrders(MOCK_ORDERS);
        setTotalPages(Math.ceil(MOCK_ORDERS.length / ITEMS_PER_PAGE));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user?.id, t]);
  
  // Apply filters
  useEffect(() => {
    if (!orders) {
      setFilteredOrders([]);
      return;
    }
    
    let result = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.order_number?.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
      case 'lowest':
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      default:
        break;
    }
    
    setFilteredOrders(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, searchQuery, sortOrder]);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    // Add null check before using slice
    return filteredOrders ? filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE) : [];
  };
  
  const currentOrders = getCurrentPageItems();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handler for page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('orders.my_orders')}</h1>
      
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                {t('orders.status')}
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="all">{t('orders.all_statuses')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="processing">{t('orders.processing')}</option>
                <option value="shipped">{t('orders.shipped')}</option>
                <option value="delivered">{t('orders.delivered')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
            </div>
            
            {/* Sort order */}
            <div>
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                {t('sort_by')}
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="newest">{t('orders.newest_first')}</option>
                <option value="oldest">{t('orders.oldest_first')}</option>
                <option value="highest">{t('orders.highest_amount')}</option>
                <option value="lowest">{t('orders.lowest_amount')}</option>
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div className="md:w-72">
            <label htmlFor="search-orders" className="block text-sm font-medium text-gray-700 mb-1">
              {t('orders.search_by_order_id')}
            </label>
            <div className="relative">
              <input
                id="search-orders"
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 pl-10 pr-3"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter actions */}
        {(statusFilter !== 'all' || searchQuery) && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-sm text-primary hover:text-primary-dark"
            >
              {t('orders.clear_filters')}
            </button>
          </div>
        )}
      </div>
      
      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.order_number')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.total')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number || `#${order.id.slice(0, 8)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(order.created_at)}</div>
                      <div className="text-xs">{formatTime(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.name || "Unknown Customer"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {t(`orders.${order.status || 'pending'}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">XAF {order.total_amount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{order.items_count} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        to={`/vendor-portal/orders/${order.id}`}
                        className="text-primary hover:text-primary-dark inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('orders.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages 
                      ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t('showing')} <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> {t('to')}{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders?.length || 0)}
                    </span>{' '}
                    {t('of')} <span className="font-medium">{filteredOrders?.length || 0}</span> {t('results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('previous')}</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === index + 1
                            ? 'bg-primary text-white border-primary z-10'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">{t('next')}</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('orders.no_orders_found')}</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? t('orders.no_orders_match_filters')
              : t('no_orders_yet_message')
            }
          </p>
          
          {(searchQuery || statusFilter !== 'all') && (
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 text-sm text-primary hover:text-primary-dark"
            >
              {t('orders.clear_filters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
