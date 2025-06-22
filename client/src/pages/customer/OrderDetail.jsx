import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Calendar, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const CustomerOrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user?.id) {
        setError(t('dashboard.user_not_authenticated'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch order directly from Supabase
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id) // Ensure user can only see their own orders
          .single();
          
        if (orderError || !order) {
          setError(t('orders.order_not_found'));
          setLoading(false);
          return;
        }

        // Fetch order items with product details
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products!order_items_product_id_fkey (
              id,
              name,
              images
            )
          `)
          .eq('order_id', orderId)
          .eq('user_id', user.id); // Ensure user can only see their own order items

        // Process items to include image URLs and handle fallback
        let processedItems = [];
        if (orderItems && !itemsError) {
          processedItems = orderItems.map(item => {
            let imageArray = [];
            try {
              if (item.products?.images) {
                if (typeof item.products.images === 'string') {
                  imageArray = JSON.parse(item.products.images);
                } else if (Array.isArray(item.products.images)) {
                  imageArray = item.products.images;
                }
              }
            } catch (e) {
              console.warn("Error parsing product images:", e);
            }
            
            return {
              ...item,
              name: item.products?.name || 'Product',
              image: imageArray.length > 0 ? imageArray[0] : '/product-placeholder.jpg'
            };
          });
        } else if (itemsError) {
          console.warn('Error fetching order items:', itemsError);
          // Fallback: fetch order items without product details
          const { data: fallbackItems, error: fallbackError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .eq('user_id', user.id);
            
          if (!fallbackError && fallbackItems) {
            processedItems = fallbackItems.map(item => ({
              ...item,
              name: 'Product',
              image: '/product-placeholder.jpg'
            }));
          }
        }
        
        // Set the complete order with items
        setOrder({
          ...order,
          items: processedItems
        });
        
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(t('orders.failed_to_load_orders'));
      } finally {
        setLoading(false);
      }
    };

    if (orderId && user?.id) {
      fetchOrderDetails();
    }
  }, [orderId, user?.id, t]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, navigate]);

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

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'completed':
        return t('paid');
      case 'pending':
        return t('orders.pending');
      case 'failed':
        return t('payment_failed');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">{t('loading_order')}</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('order_not_found')}</h2>
          <p className="text-gray-600 mb-6">{error || t('order_not_found_message')}</p>
          <Button
            as={Link}
            to="/account/orders"
            variant="primary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {t('orders.back_to_orders')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          as={Link}
          to="/account/orders"
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-4"
        >
          {t('orders.back_to_orders')}
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('orders.order_details')}</h1>
            <p className="text-gray-600">
              {t('orders.order_number')}: #{order.id.slice(-8)}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Badge variant={getStatusBadgeVariant(order.status)} size="lg">
              {getStatusText(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">{t('orders.order_date')}</p>
              <p className="font-medium">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">{t('orders.order_status')}</p>
              <p className="font-medium">{getStatusText(order.status)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">{t('orders.payment_status')}</p>
              <p className="font-medium">{getPaymentStatusText(order.payment_status)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 text-gray-500 mr-3 flex items-center justify-center">
              XAF
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('orders.total')}</p>
              <p className="font-medium">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <Card className="mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">{t('orders.order_items')}</h2>
          </div>
          
          <div className="divide-y">
            {order.items.map((item, index) => (
              <div key={item.id || index} className="p-6 flex">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                  <img
                    src={item.image || '/product-placeholder.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/product-placeholder.jpg';
                    }}
                  />
                </div>
                
                <div className="ml-4 flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('orders.quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('orders.price')}: {formatCurrency(item.price)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                      <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Addresses and Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Shipping Address */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="font-semibold">{t('orders.shipping_address')}</h3>
          </div>
          
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {order.shipping_address?.fullName || 'N/A'}
            </p>
            <p>{order.shipping_address?.address || 'N/A'}</p>
            <p>
              {order.shipping_address?.city || 'N/A'}, {order.shipping_address?.region || 'N/A'}
            </p>
            <p>{order.shipping_address?.phoneNumber || 'N/A'}</p>
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="font-semibold">{t('payment_information')}</h3>
          </div>
          
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payment_method')}:</span>
              <span className="font-medium">
                {order.payment_method === 'simulated_payment' ? 'Simulated Payment (Dev)' :
                 order.payment_method === 'mtn_mobile_money' ? 'MTN Mobile Money' :
                 order.payment_method === 'orange_money' ? 'Orange Money' :
                 t(order.payment_method || 'mobile_money')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">{t('payment_status')}:</span>
              <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'}>
                {getPaymentStatusText(order.payment_status)}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">{t('order_summary')}</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('orders.subtotal')}</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('orders.shipping')}</span>
            <span>{order.shipping_fee > 0 ? formatCurrency(order.shipping_fee) : t('free')}</span>
          </div>
          
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>{t('orders.total')}</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerOrderDetail;
          
          