import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Package, 
  ShoppingBag, 
  MapPin, 
  ChevronDown,
  AlertTriangle,
  Truck,
  CheckCircle
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const VendorOrderDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { get, post } = useApi();
  const [orderData, setOrderData] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemStatusUpdating, setItemStatusUpdating] = useState({});
  const [showStatusDropdown, setShowStatusDropdown] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch order details
        const response = await get(`/orders/${orderId}`);
        setOrderData(response.data);

        // Extract the vendor's items from the order
        const vendorId = localStorage.getItem('userId');
        if (response.data && response.data.items) {
          const items = response.data.items.filter(item => item.vendor_id === vendorId);
          setVendorItems(items);
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setError(t('failed_to_load_order_details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [get, orderId, t]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Toggle status dropdown
  const toggleStatusDropdown = (itemId) => {
    setShowStatusDropdown(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Update item status
  const updateItemStatus = async (itemId, newStatus) => {
    try {
      setItemStatusUpdating(prev => ({ ...prev, [itemId]: true }));
      
      await post(`/orders/items/${itemId}/status`, { status: newStatus });
      
      // Update local state
      setVendorItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      
      // Hide dropdown
      setShowStatusDropdown(prev => ({ ...prev, [itemId]: false }));
    } catch (error) {
      console.error('Failed to update item status:', error);
      // Show error toast or message
    } finally {
      setItemStatusUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <button 
          onClick={() => navigate('/vendor-portal/orders')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back_to_orders')}
        </button>
        
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">{t('order_not_found')}</h2>
          <p className="text-gray-600 mb-4">
            {error || t('order_not_found_message')}
          </p>
          <Link
            to="/vendor-portal/orders"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {t('view_all_orders')}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate vendor's totals for this order
  const vendorSubtotal = vendorItems.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/vendor-portal/orders')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('back_to_orders')}
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('order')} #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500">
            {t('placed_on')} {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mt-2 md:mt-0">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {t(order.payment_status)}
          </span>
        </div>
      </div>
      
      {/* Your items section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('your_items')}</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('product')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quantity')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('total')}
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
              {vendorItems.map((item) => (
                <tr key={item.id}>
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
                          <ShoppingBag className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || t('unknown_product')}
                        </div>
                        {item.variant && (
                          <div className="text-xs text-gray-500">
                            {Object.entries(item.variant).map(([key, value]) => (
                              <span key={key}>
                                {key}: {value}
                              </span>
                            )).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    <div className="relative">
                      <button 
                        onClick={() => toggleStatusDropdown(item.id)}
                        className="text-primary hover:text-primary-dark flex items-center"
                        disabled={item.status === 'delivered' || item.status === 'cancelled'}
                      >
                        {t('update_status')}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                      
                      {showStatusDropdown[item.id] && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'processing')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('mark_as_processing')}
                              </button>
                            )}
                            
                            {(item.status === 'pending' || item.status === 'processing') && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'shipped')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('mark_as_shipped')}
                              </button>
                            )}
                            
                            {(item.status === 'processing' || item.status === 'shipped') && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'delivered')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('mark_as_delivered')}
                              </button>
                            )}
                            
                            {item.status !== 'cancelled' && item.status !== 'delivered' && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'cancelled')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                {t('cancel_item')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end">
          <div className="w-full sm:w-1/3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">{t('subtotal')}:</span>
              <span>{formatCurrency(vendorSubtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>{t('your_total')}:</span>
              <span>{formatCurrency(vendorSubtotal)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold ml-2">{t('shipping_information')}</h2>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-gray-600">{order.shippingAddress.address}</p>
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.region}, {order.shippingAddress.country}
          </p>
          <p className="text-gray-600">{order.shippingAddress.phoneNumber}</p>
        </div>
      </div>
      
      {/* Fulfillment tips */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Truck className="h-5 w-5 text-gray-500 mr-2" />
          {t('fulfillment_tips')}
        </h2>
        
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('fulfillment_tip_1')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('fulfillment_tip_2')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('fulfillment_tip_3')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('fulfillment_tip_4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VendorOrderDetail;
