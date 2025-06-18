import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, AlertTriangle, Clock } from 'lucide-react';
import axios from 'axios';

const CustomerOrderDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch order from our API
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders/${orderId}`
        );
        
        if (response.data?.success) {
          setOrder(response.data.order);
        } else {
          setError(response.data?.message || t('order_not_found'));
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setError(error.response?.data?.message || t('failed_to_load_order_details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, t]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/account/orders')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back_to_orders')}
        </button>
        
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('order_not_found')}</h2>
          <p className="text-gray-500 mb-6">{error || t('order_not_found_message')}</p>
          <Link
            to="/account/orders"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {t('view_all_orders')}
          </Link>
        </div>
      </div>
    );
  }

  // Safe order ID display
  const displayOrderId = order.id ? String(order.id).slice(0, 8) : 'N/A';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/account/orders')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('back_to_orders')}
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('order')} #{displayOrderId}</h1>
          <p className="text-gray-500">
            {t('placed_on')} {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {t(order.status)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
            {t(order.payment_status)}
          </span>
        </div>
      </div>
      
      {/* Order Status Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('order_status')}</h2>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3.5 top-3 h-full w-px bg-gray-200"></div>
          
          <div className="space-y-6">
            {/* Order placed */}
            <div className="flex">
              <div className="flex-shrink-0 bg-green-500 rounded-full h-7 w-7 flex items-center justify-center z-10">
                <CheckIcon className="h-4 w-4 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">{t('order_placed')}</h3>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Processing */}
            <div className="flex">
              <div className={`flex-shrink-0 rounded-full h-7 w-7 flex items-center justify-center z-10 ${
                ['processing', 'completed'].includes(order.status) 
                ? 'bg-green-500' 
                : order.status === 'cancelled'
                  ? 'bg-red-500'
                  : 'bg-gray-200'
              }`}>
                {['processing', 'completed'].includes(order.status) ? (
                  <CheckIcon className="h-4 w-4 text-white" />
                ) : order.status === 'cancelled' ? (
                  <XIcon className="h-4 w-4 text-white" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">{t('processing')}</h3>
                <p className="text-xs text-gray-500">
                  {['processing', 'completed'].includes(order.status)
                    ? t('your_order_is_being_processed', 'Your order is being processed')
                    : order.status === 'cancelled'
                    ? t('order_processing_cancelled', 'Order processing cancelled')
                    : t('waiting_for_processing', 'Waiting for processing')}
                </p>
              </div>
            </div>
            
            {/* Shipped */}
            <div className="flex">
              <div className={`flex-shrink-0 rounded-full h-7 w-7 flex items-center justify-center z-10 ${
                order.status === 'completed' 
                  ? 'bg-green-500' 
                  : order.status === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-gray-200'
              }`}>
                {order.status === 'completed' ? (
                  <CheckIcon className="h-4 w-4 text-white" />
                ) : order.status === 'cancelled' ? (
                  <XIcon className="h-4 w-4 text-white" />
                ) : (
                  <Truck className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">{t('shipped')}</h3>
                <p className="text-xs text-gray-500">
                  {order.status === 'completed'
                    ? t('your_order_has_been_shipped', 'Your order has been shipped')
                    : order.status === 'cancelled'
                    ? t('shipping_cancelled', 'Shipping cancelled')
                    : t('waiting_for_shipping', 'Waiting for shipping')}
                </p>
                {order.tracking_number && (
                  <p className="text-xs text-gray-900 mt-1">
                    {t('tracking_number')}: {order.tracking_number}
                  </p>
                )}
              </div>
            </div>
            
            {/* Delivered */}
            <div className="flex">
              <div className={`flex-shrink-0 rounded-full h-7 w-7 flex items-center justify-center z-10 ${
                order.status === 'completed' 
                  ? 'bg-green-500' 
                  : order.status === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-gray-200'
              }`}>
                {order.status === 'completed' ? (
                  <CheckIcon className="h-4 w-4 text-white" />
                ) : order.status === 'cancelled' ? (
                  <XIcon className="h-4 w-4 text-white" />
                ) : (
                  <Package className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium">{t('delivered')}</h3>
                <p className="text-xs text-gray-500">
                  {order.status === 'completed'
                    ? t('your_order_has_been_delivered', 'Your order has been delivered')
                    : order.status === 'cancelled'
                    ? t('delivery_cancelled', 'Delivery cancelled')
                    : t('waiting_for_delivery', 'Waiting for delivery')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('order_items')}</h2>
        
        <div className="divide-y divide-gray-200">
          {(order.items || []).map((item, index) => (
            <div key={item.id || index} className="py-4 flex">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image || '/product-placeholder.jpg'}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>
                      <Link to={`/products/${item.product_id || item.productId}`}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="ml-4">{formatCurrency(item.total || (item.price * item.quantity))}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('quantity')}: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                  {item.variant && (
                    <p className="mt-1 text-sm text-gray-500">
                      {Object.entries(item.variant).map(([key, value], i, arr) => (
                        <span key={key}>
                          {key}: {value}
                          {i < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 items-end">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status || 'pending')}`}>
                    {t(item.status || 'pending')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping & Billing info */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold ml-2">{t('shipping_information')}</h2>
          </div>
          
          <div className="space-y-1 mb-6">
            <p className="font-medium">{order.shipping_address?.fullName || 'N/A'}</p>
            <p>{order.shipping_address?.address || 'N/A'}</p>
            <p>{order.shipping_address?.city || 'N/A'}, {order.shipping_address?.region || 'N/A'}</p>
            <p>{order.shipping_address?.phoneNumber || 'N/A'}</p>
          </div>
          
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold ml-2">{t('billing_information')}</h2>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium">{order.billing_address?.fullName || order.shipping_address?.fullName || 'N/A'}</p>
            <p>{order.billing_address?.address || order.shipping_address?.address || 'N/A'}</p>
            <p>{order.billing_address?.city || order.shipping_address?.city || 'N/A'}, {order.billing_address?.region || order.shipping_address?.region || 'N/A'}</p>
            <p>{order.billing_address?.phoneNumber || order.shipping_address?.phoneNumber || 'N/A'}</p>
          </div>
        </div>
        
        {/* Payment info & Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold ml-2">{t('payment_details')}</h2>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>{t('payment_method')}:</span>
              <span>
                {order.payment_method === 'simulated_payment' ? 'Simulated Payment (Dev)' :
                 order.payment_method === 'mtn_mobile_money' ? 'MTN Mobile Money' :
                 order.payment_method === 'orange_money' ? 'Orange Money' :
                 t(order.payment_method || 'mobile_money')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('payment_status')}:</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                {t(order.payment_status)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold ml-2">{t('order_summary')}</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('subtotal')}:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>{t('shipping')}:</span>
              <span>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : t('free')}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>{t('total')}:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon components
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default CustomerOrderDetail;
