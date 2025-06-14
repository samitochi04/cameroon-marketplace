import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader, Clock, Package, ArrowRight, ChevronRight, ShoppingBag } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { get } = useApi();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError(t('failed_to_load_order'));
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, get, t]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('order_not_found')}</h1>
        <p className="text-gray-600 mb-6">{error || t('order_not_found_description')}</p>
        <Button as={Link} to="/orders" variant="primary">
          {t('view_your_orders')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
          {t('order_number')}: <span className="font-semibold">{order.id}</span>
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
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              {order.status === 'processing' || order.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <Clock className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{t('processing')}</h3>
              <p className="text-sm text-gray-500">
                {order.status === 'processing' || order.status === 'completed'
                  ? t('processing_in_progress')
                  : t('processing_waiting')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
              {order.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-gray-600" />
              ) : (
                <Package className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{t('delivered')}</h3>
              <p className="text-sm text-gray-500">
                {order.status === 'completed'
                  ? t('delivered_success')
                  : t('delivered_waiting')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Order summary */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-6">{t('order_summary')}</h2>
        
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h3>{item.name}</h3>
                  <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t('quantity')}: {item.quantity}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t('sold_by')}: {item.vendor?.name || t('marketplace')}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span>{t('subtotal')}</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{t('discount')}</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>{t('shipping')}</span>
            <span>{formatCurrency(order.shipping)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>{t('tax')}</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          
          <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
            <span>{t('total')}</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Shipping and payment info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('shipping_information')}</h3>
          <div className="text-sm">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.region}</p>
            <p>{order.shippingAddress.phoneNumber}</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('payment_information')}</h3>
          <div className="text-sm">
            <p>
              <span className="font-medium">{t('payment_method')}:</span> {order.paymentMethod === 'kora' ? 'Kora Pay' : t(order.paymentMethod)}
            </p>
            <p>
              <span className="font-medium">{t('payment_status')}:</span> <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>{t(order.paymentStatus)}</Badge>
            </p>
          </div>
        </Card>
      </div>

      {/* Next steps */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{t('what_happens_next')}</h2>
        <p className="text-gray-600 mb-6">{t('what_happens_next_description')}</p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            as={Link} 
            to="/orders" 
            variant="primary" 
            rightIcon={ChevronRight}
          >
            {t('track_your_order')}
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
