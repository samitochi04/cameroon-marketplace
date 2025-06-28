import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader, Clock, Package, ChevronRight, ShoppingBag, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // First try to get pending order from localStorage
        const pendingOrderData = localStorage.getItem('pendingOrder');
        if (pendingOrderData) {
          try {
            const pendingOrder = JSON.parse(pendingOrderData);
            
            // Create a mock order object from pending order data
            const mockOrder = {
              id: orderId,
              totalAmount: pendingOrder.amount,
              subtotal: pendingOrder.amount,
              shipping: 0,
              tax: 0,
              discount: 0,
              status: 'pending',
              paymentStatus: 'completed',
              paymentMethod: 'campay',
              createdAt: new Date().toISOString(),
              shippingAddress: pendingOrder.shippingAddress || {
                fullName: pendingOrder.customer?.name || 'Customer',
                address: pendingOrder.customer?.address || 'N/A',
                city: pendingOrder.customer?.city || 'N/A',
                region: 'N/A',
                phoneNumber: pendingOrder.customer?.phone || 'N/A'
              }
            };
            
            setOrder(mockOrder);
            
            // Clear the pending order data
            localStorage.removeItem('pendingOrder');
            setLoading(false);
            return; // Exit early since we found the order
          } catch (parseError) {
            console.error('Error parsing pending order:', parseError);
          }
        }
        
        // Try to fetch from API as fallback - include userId for security
        if (user?.id) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders/${orderId}?userId=${user.id}`
            );
            
            if (response.data?.success) {
              setOrder(response.data.order);
            } else {
              setError(response.data?.message || t('order_not_found'));
            }
          } catch (apiError) {
            console.error('API fetch error:', apiError);
            setError(t('failed_to_load_order'));
          }
        } else {
          setError(t('user_not_authenticated'));
        }
        
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(t('failed_to_load_order'));
      } finally {
        setLoading(false);
      }
    };

    if (orderId && user) {
      fetchOrderDetails();
    }
  }, [orderId, t, user]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">{t('loading_order')}</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('order_not_found')}</h1>
        <p className="text-gray-600 mb-6">{error || t('order_not_found_message')}</p>
        <div className="space-x-4">
          <Button as={Link} to="/account/orders" variant="primary">
            {t('view_your_orders')}
          </Button>
          <Button as={Link} to="/" variant="outline">
            {t('back_to_home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Payment Success Notification */}
      {showPaymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-green-800">{t('payment_successful', 'Paiement réussi!')}</h3>
              <p className="text-green-700 text-sm">
                {t('payment_success_message', 'Votre paiement a été traité avec succès et votre commande est confirmée.')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowPaymentSuccess(false)}
            className="text-green-700 hover:bg-green-100 rounded-full p-1"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Order confirmation header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('order_confirmed')}</h1>
        <p className="text-lg text-gray-600">
          {t('order_confirmation_message')}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          {t('order_number')}: <span className="font-semibold">#{order.id}</span>
        </div>
      </div>

      {/* Order status timeline */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-6">{t('order_status')}</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t('order_placed')}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()} {new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t('processing')}</h3>
              <p className="text-sm text-gray-500">
                {t('processing_waiting')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">{t('delivered')}</h3>
              <p className="text-sm text-gray-500">
                {t('delivered_waiting')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Order summary */}
      {order.items && order.items.length > 0 && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-6">{t('order_summary')}</h2>
          
          <div className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <div key={item.id || index} className="py-4 flex">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.image || '/product-placeholder.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = '/product-placeholder.jpg';
                    }}
                  />
                </div>
                <div className="ml-4 flex flex-1 flex-col">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{item.name}</h3>
                    <p className="ml-4">{formatCurrency(item.total)}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('quantity')}: {item.quantity}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('price_per_item')}: {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(order.subtotal || order.totalAmount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>{t('shipping')}</span>
              <span>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : t('free')}</span>
            </div>
            
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
              <span>{t('total')}</span>
              <span>{formatCurrency(order.total_amount || order.totalAmount)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Shipping and payment info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('shipping_information')}</h3>
          <div className="text-sm">
            <p className="font-medium">{order.shipping_address?.fullName || 'N/A'}</p>
            <p>{order.shipping_address?.address || 'N/A'}</p>
            <p>{order.shipping_address?.city || 'N/A'}, {order.shipping_address?.region || 'N/A'}</p>
            <p>{order.shipping_address?.phoneNumber || 'N/A'}</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('payment_information')}</h3>
          <div className="text-sm">
            <p className="mb-2">
              <span className="font-medium">{t('payment_method')}:</span> {
                order.payment_method === 'simulated_payment' ? 'Simulated Payment (Dev)' :
                order.payment_method === 'mtn_mobile_money' ? 'MTN Mobile Money' :
                order.payment_method === 'orange_money' ? 'Orange Money' :
                t(order.payment_method || 'mobile_money')
              }
            </p>
            <p>
              <span className="font-medium">{t('payment_status')}:</span>{' '}
              <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'}>
                {order.payment_status === 'completed' ? t('paid') : t(order.payment_status || 'pending')}
              </Badge>
            </p>
          </div>
        </Card>
      </div>

      {/* Next steps */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{t('what_happens_next')}</h2>
        <p className="text-gray-600 mb-6">
          {t('what_happens_next_description')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            as={Link} 
            to="/account/orders" 
            variant="primary" 
            rightIcon={ChevronRight}
          >
            {t('view_your_orders')}
          </Button>
          
          <Button 
            as={Link} 
            to="/products" 
            variant="outline" 
            rightIcon={ShoppingBag}
          >
            {t('continue_shopping')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

