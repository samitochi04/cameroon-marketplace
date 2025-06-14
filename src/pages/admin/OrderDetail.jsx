import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Package, 
  User,
  ShoppingBag, 
  MapPin, 
  CreditCard,
  Edit,
  Printer,
  AlertTriangle,
  Truck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const AdminOrderDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { get, post } = useApi();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await get(`/orders/${orderId}/admin`);
      
      if (response.data) {
        setOrder(response.data.order);
        setOrderItems(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setError(t('failed_to_load_order_details'));
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const updateOrderStatus = async (status) => {
    try {
      setUpdateLoading(true);
      await post(`/orders/${orderId}/status`, { status });
      
      // Update local state
      setOrder(prev => ({ ...prev, status }));
      
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update order status:', error);
      setError(t('failed_to_update_status'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentStatus) => {
    try {
      setUpdateLoading(true);
      await post(`/orders/${orderId}/payment-status`, { status: paymentStatus });
      
      // Update local state
      setOrder(prev => ({ ...prev, payment_status: paymentStatus }));
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setError(t('failed_to_update_payment_status'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
          onClick={() => navigate('/admin/orders')}
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
            to="/admin/orders"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {t('view_all_orders')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/admin/orders')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('back_to_orders')}
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('order')} #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500">
            {t('placed_on')} {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-1" />
            {t('print')}
          </button>
          
          <button
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            <Edit className="h-4 w-4 mr-1" />
            {t('update_status')}
          </button>
        </div>
      </div>
      
      {/* Order Status and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Order Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="h-5 w-5 text-gray-500 mr-2" />
            {t('order_status')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">{t('status')}</h3>
              <div className="mt-1">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t(order.status)}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">{t('payment_status')}</h3>
              <div className="mt-1 flex items-center space-x-2">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${
                  order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t(order.payment_status)}
                </span>
                
                <div className="dropdown relative">
                  <button
                    className="text-primary hover:text-primary-dark text-sm"
                    onClick={() => {
                      const elem = document.getElementById("paymentDropdown");
                      elem.classList.toggle("hidden");
                    }}
                  >
                    {t('update')}
                  </button>
                  <div id="paymentDropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          updatePaymentStatus('pending');
                          document.getElementById("paymentDropdown").classList.add("hidden");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={updateLoading}
                      >
                        {t('pending')}
                      </button>
                      <button
                        onClick={() => {
                          updatePaymentStatus('paid');
                          document.getElementById("paymentDropdown").classList.add("hidden");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={updateLoading}
                      >
                        {t('paid')}
                      </button>
                      <button
                        onClick={() => {
                          updatePaymentStatus('failed');
                          document.getElementById("paymentDropdown").classList.add("hidden");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={updateLoading}
                      >
                        {t('failed')}
                      </button>
                      <button
                        onClick={() => {
                          updatePaymentStatus('refunded');
                          document.getElementById("paymentDropdown").classList.add("hidden");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={updateLoading}
                      >
                        {t('refunded')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">{t('payment_method')}</h3>
              <p className="mt-1 text-sm font-medium">
                {order.payment_method}
              </p>
            </div>
            
            {order.payment_intent_id && (
              <div>
                <h3 className="text-sm text-gray-500">{t('payment_id')}</h3>
                <p className="mt-1 text-sm font-mono bg-gray-100 p-1 rounded">
                  {order.payment_intent_id}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            {t('customer_information')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">{t('customer_name')}</h3>
              <p className="mt-1 text-sm font-medium">
                {order.user?.firstName} {order.user?.lastName}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">{t('email')}</h3>
              <p className="mt-1 text-sm font-medium">
                {order.user?.email}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm text-gray-500">{t('phone')}</h3>
              <p className="mt-1 text-sm font-medium">
                {order.shippingAddress?.phoneNumber || t('not_provided')}
              </p>
            </div>
            
            <Link
              to={`/admin/users/${order.user_id}`}
              className="text-primary hover:underline text-sm inline-flex items-center"
            >
              {t('view_customer_profile')}
              <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
            </Link>
          </div>
        </div>
        
        {/* Shipping Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            {t('shipping_information')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500">{t('shipping_address')}</h3>
              <div className="mt-1">
                <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm">{order.shippingAddress.address}</p>
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.region}, {order.shippingAddress.country}
                </p>
                <p className="text-sm">{order.shippingAddress.postalCode}</p>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div>
                <h3 className="text-sm text-gray-500">{t('tracking_number')}</h3>
                <p className="mt-1 text-sm font-mono bg-gray-100 p-1 rounded">
                  {order.trackingNumber}
                </p>
              </div>
            )}
            
            {order.notes && (
              <div>
                <h3 className="text-sm text-gray-500">{t('order_notes')}</h3>
                <p className="mt-1 text-sm">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">{t('ordered_items')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('product')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('quantity')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('total')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || t('product_not_found')}
                        </div>
                        <Link
                          to={`/admin/products/${item.product_id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {t('view_product')}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.vendor?.storeName || t('vendor_not_found')}
                    </div>
                    {item.vendor && (
                      <Link
                        to={`/admin/vendors/${item.vendor_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {t('view_vendor')}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      item.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2 text-gray-600">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>{t('shipping')}</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>{t('tax')}</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-lg">
                <span>{t('total')}</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order History/Timeline */}
      {order.history && order.history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold">{t('order_timeline')}</h2>
          </div>
          
          <div className="p-6">
            <ol className="relative border-l border-gray-200">
              {order.history.map((event, index) => (
                <li key={index} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-8 ring-white">
                    {event.type === 'status_change' ? <Truck className="w-3 h-3" /> : 
                     event.type === 'payment' ? <CreditCard className="w-3 h-3" /> : 
                     <Package className="w-3 h-3" />}
                  </span>
                  <h3 className="flex items-center mb-1 text-sm font-semibold text-gray-900">
                    {event.title}
                    {index === 0 && <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">{t('latest')}</span>}
                  </h3>
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                  <p className="text-sm font-normal text-gray-500">
                    {event.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{t('update_order_status')}</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => updateOrderStatus('pending')}
                disabled={updateLoading}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  order.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{t('pending')}</span>
                {order.status === 'pending' && <CheckCircle className="h-5 w-5 text-yellow-500" />}
              </button>
              
              <button 
                onClick={() => updateOrderStatus('processing')}
                disabled={updateLoading}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  order.status === 'processing' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{t('processing')}</span>
                {order.status === 'processing' && <CheckCircle className="h-5 w-5 text-blue-500" />}
              </button>
              
              <button 
                onClick={() => updateOrderStatus('completed')}
                disabled={updateLoading}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  order.status === 'completed' ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{t('completed')}</span>
                {order.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              </button>
              
              <button 
                onClick={() => updateOrderStatus('cancelled')}
                disabled={updateLoading}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  order.status === 'cancelled' ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{t('cancelled')}</span>
                {order.status === 'cancelled' && <XCircle className="h-5 w-5 text-red-500" />}
              </button>
              
              <button 
                onClick={() => updateOrderStatus('refunded')}
                disabled={updateLoading}
                className={`w-full flex items-center justify-between p-3 rounded-md ${
                  order.status === 'refunded' ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{t('refunded')}</span>
                {order.status === 'refunded' && <CheckCircle className="h-5 w-5 text-purple-500" />}
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;
