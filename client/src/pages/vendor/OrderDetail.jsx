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
  CheckCircle,
  DollarSign,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const VendorOrderDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orderId } = useParams();  const { user } = useAuth();
  const [vendorItems, setVendorItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  const [error, setError] = useState(null);
  const [itemStatusUpdating, setItemStatusUpdating] = useState({});
  const [showStatusDropdown, setShowStatusDropdown] = useState({});
  const [payoutNotification, setPayoutNotification] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user?.id || !orderId) return;
      
      try {
        setIsLoading(true);
        
        // First, get the vendor's products to verify they have items in this order
        const { data: vendorProducts, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('vendor_id', user.id);
        
        if (productsError) throw productsError;
          if (!vendorProducts || vendorProducts.length === 0) {
          setError('You have no products to display orders for.');
          return;
        }
        
        const productIds = vendorProducts.map(p => p.id);        // Get the order items for this vendor's products in this specific order
        const { data: orderItems, error: itemsError } = await supabase
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
          .eq('order_id', orderId)
          .in('product_id', productIds);
        
        if (itemsError) throw itemsError;
        
        if (!orderItems || orderItems.length === 0) {
          setError('You have no items in this order.');
          return;
        }
          // Get product details separately
        const { data: productsData, error: productsDataError } = await supabase
          .from('products')
          .select('id, name, images, vendor_id')
          .in('id', productIds);
        
        if (productsDataError) throw productsDataError;
          // Create a map of products for easy lookup
        const productsMap = productsData?.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {}) || {};
        
        // Get the order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            status,
            total_amount,
            payment_status,
            payment_method,
            shipping_address,
            created_at,
            profiles!inner (
              id,
              name,
              email
            )
          `)
          .eq('id', orderId)
          .single();
        
        if (orderError) throw orderError;
        
        if (!orderData) {
          setError(t('order_not_found'));
          return;
        }
          // Set the data
        setOrder({
          id: orderData.id,
          user_id: orderData.user_id,
          status: orderData.status,
          total_amount: orderData.total_amount,
          payment_status: orderData.payment_status,
          payment_method: orderData.payment_method,
          shippingAddress: typeof orderData.shipping_address === 'string' 
            ? JSON.parse(orderData.shipping_address) 
            : orderData.shipping_address || {},
          created_at: orderData.created_at,          customer: {
            name: orderData.profiles?.name || 'Unknown Customer',
            email: orderData.profiles?.email
          }
        });
          setVendorItems(orderItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          status: item.status,
          product: {
            id: item.product_id,
            name: productsMap[item.product_id]?.name || 'Unknown Product',
            image: productsMap[item.product_id]?.images
          }
        })));
        
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(t('failed_to_load_order_details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [user?.id, orderId, t]);

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
  };  // Update item status
  const updateItemStatus = async (itemId, newStatus, retryCount = 0) => {
    try {
      setItemStatusUpdating(prev => ({ ...prev, [itemId]: true }));
      
      
      // Get the auth token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/vendor/order-items/${itemId}/status`;
      
      if (import.meta.env.DEBUG_MODE === "true") {
        console.log(`API URL: ${apiUrl}`);
      }
      
      
      // Call our authenticated backend API instead of direct Supabase
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Send Supabase JWT token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        // If this is a server error (500), retry up to 2 times
        if (response.status >= 500 && retryCount < 2) {
          // Briefly release the updating state to show it's retrying
          setItemStatusUpdating(prev => ({ ...prev, [itemId]: false }));
          
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return updateItemStatus(itemId, newStatus, retryCount + 1);
        }
        
        throw new Error(result.message || 'Failed to update item status');
      }
      
      // Update local state
      setVendorItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
        // Show success message if status changed to processing (payout triggered)
      if (newStatus === 'processing') {
        // Check if the API response included payout information
        const payoutInfo = result.data?.payout;
        
        if (payoutInfo && payoutInfo.status === 'failed') {
          // Show a warning notification if payout failed but order update succeeded
          setPayoutNotification({
            type: 'warning',
            message: 'Order updated to processing! However, there was an issue processing your payout. Our team has been notified and will resolve this soon. You will receive an email notification with details.',
            timestamp: Date.now(),
            details: payoutInfo.error || 'Payment gateway error'
          });
        } else {
          // Show success notification for normal case
          setPayoutNotification({
            type: 'success',
            message: 'Order updated to processing! Payout has been initiated and email notification sent.',
            timestamp: Date.now()
          });
        }
        
        // Auto-hide notification after 15 seconds
        setTimeout(() => {
          setPayoutNotification(null);
        }, 15000);
      }
        // Check if we need to update the overall order status
      // Get all order items for this order to check their statuses
      const { data: allOrderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('id, status')
        .eq('order_id', orderId);
      
      if (!fetchError && allOrderItems) {
        // Update the statuses with the new status we just changed
        const updatedStatuses = allOrderItems.map(item => 
          item.id === itemId ? newStatus : item.status
        );
        
        // Check if all items have the same status
        const uniqueStatuses = [...new Set(updatedStatuses)];
        
        // If all items have the same status, update the order status
        if (uniqueStatuses.length === 1) {
          const orderStatus = uniqueStatuses[0];
          
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ status: orderStatus })
            .eq('id', orderId);
          
          if (!orderUpdateError) {
            // Update local order state
            setOrder(prev => ({
              ...prev,
              status: orderStatus
            }));
          } else {
            console.error('Failed to update order status:', orderUpdateError);
          }
        } else { 
          if (import.meta.env.DEBUG_MODE === "true") {
            console.log(`Items have mixed statuses: ${uniqueStatuses.join(', ')}`);
          }
        }
      }
      
      // Hide dropdown
      setShowStatusDropdown(prev => ({ ...prev, [itemId]: false }));
    } catch (error) {
      console.error('Failed to update item status:', error);
      // Log detailed debugging information
      console.error({
        errorMessage: error.message,
        itemId,
        newStatus,
        vendorItemsCount: vendorItems?.length || 0,
        itemDetails: vendorItems?.find(item => item.id === itemId) || 'Item not found in local state'
      });
      
      // Show error notification
      let errorMessage = error.message;
      
      // More user-friendly error messages
      if (errorMessage.includes("Could not embed")) {
        errorMessage = "Database configuration issue. Please contact support.";
      } else if (errorMessage.includes("not found")) {
        errorMessage = "Order item not found. It may have been removed or modified.";
      } else if (errorMessage.includes("Access denied")) {
        errorMessage = "You don't have permission to update this item.";
      } else if (errorMessage.includes("Missing vendor price data")) {
        errorMessage = "Product price information is missing. Please contact support.";
      } else if (errorMessage.includes("invalid price")) {
        errorMessage = "Product price is invalid. Please update the product price.";
      } else if (errorMessage.includes("Error fetching order item")) {
        errorMessage = "Unable to find order information. Please refresh and try again.";
      } else if (errorMessage.includes("payment gateway") || errorMessage.includes("payout failed")) {
        errorMessage = "Payment gateway error. Your order status was updated, but there was an issue with the payout. Our team has been notified.";
      } else if (errorMessage.includes("Internal server error")) {
        errorMessage = "Server error. Please try again later. Your request may have been processed despite the error.";
      }
      
      setPayoutNotification({
        type: 'error',
        message: `Error: ${errorMessage}. Please try again or contact support.`,
        timestamp: Date.now()
      });
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setPayoutNotification(null);
      }, 10000);
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
        {t('orders.back_to_orders')}
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('order')} #{order.id.slice(0, 8)}</h1>
          <p className="text-gray-500">
            {t('orders.placed_on')} {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mt-2 md:mt-0">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {t('orders.payment_status')}
            {t(' : ')}
            {t(order.payment_status)}
          </span>        </div>
      </div>
      
      {/* Notification (Success, Warning, or Error) */}
      {payoutNotification && (
        <div className={`${
          payoutNotification.type === 'error' 
            ? "bg-red-50 border border-red-200 text-red-700" 
            : payoutNotification.type === 'warning'
              ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
              : "bg-green-50 border border-green-200 text-green-700"
        } px-4 py-3 rounded-md mb-6 flex items-start`}>
          <div className="flex">
            {payoutNotification.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            ) : payoutNotification.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <DollarSign className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {payoutNotification.type === 'error' 
                  ? 'Error' 
                  : payoutNotification.type === 'warning'
                    ? 'Order Updated - Payout Pending'
                    : 'Payout Processed!'}
              </p>
              <p className="text-sm mt-1">{payoutNotification.message}</p>
              {payoutNotification.details && (
                <p className="text-sm mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                  Details: {payoutNotification.details}
                </p>
              )}
              {(payoutNotification.type === 'success' || payoutNotification.type === 'warning') && (
                <div className="flex items-center mt-2 text-sm">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>Email notification sent to your registered email</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Your items section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">{t('orders.your_items')}</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor.product')}
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
                      )}                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || t('unknown_product')}
                        </div>
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
                        {t('orders.update_status')}
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
                                {t('orders.mark_as_processing')}
                              </button>
                            )}
                            
                            {(item.status === 'pending' || item.status === 'processing') && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'shipped')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('orders.mark_as_shipped')}
                              </button>
                            )}
                            
                            {(item.status === 'processing' || item.status === 'shipped') && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'delivered')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {t('orders.mark_as_delivered')}
                              </button>
                            )}
                            
                            {item.status !== 'cancelled' && item.status !== 'delivered' && (
                              <button
                                onClick={() => updateItemStatus(item.id, 'cancelled')}
                                disabled={itemStatusUpdating[item.id]}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                {t('orders.cancel_item')}
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
              <span>{t('orders.your_total')}:</span>
              <span>{formatCurrency(vendorSubtotal)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold ml-2">{t('orders.shipping_information')}</h2>
        </div>        
        <div className="border-t border-gray-200 pt-4">
          <p className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
          <p className="text-gray-600">{order.shippingAddress?.address || 'N/A'}</p>
          <p className="text-gray-600">
            {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.region || 'N/A'}, {order.shippingAddress?.country || 'N/A'}
          </p>
          <p className="text-gray-600">{order.shippingAddress?.phoneNumber || 'N/A'}</p>
        </div>
      </div>
      
      {/* Fulfillment tips */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Truck className="h-5 w-5 text-gray-500 mr-2" />
          {t('orders.fulfillment_tips')}
        </h2>
        
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('orders.fulfillment_tip_1')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('orders.fulfillment_tip_2')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('orders.fulfillment_tip_3')}</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
            <span>{t('orders.fulfillment_tip_4')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VendorOrderDetail;
