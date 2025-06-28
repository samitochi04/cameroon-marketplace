import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  const { t } = useTranslation();

  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'shipped':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('orders.order')} #${order.id?.slice(-8) || 'N/A'}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Order Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getOrderStatusIcon(order.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('orders.order')} #{order.id?.slice(-8) || 'N/A'}
              </h3>
              <p className="text-sm text-gray-500">
                {t('orders.placed_on')} {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {t(`orders.${order.status || 'pending'}`)}
            </Badge>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(order.totalAmount || 0)}
            </p>
          </div>
        </div>

        {/* Customer and Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              {t('dashboard.customer')}
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">{t('profile.name')}</span>
                <p className="text-sm">{order.user?.name || order.user?.email || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('profile.email')}</span>
                <p className="text-sm">{order.user?.email || 'Not provided'}</p>
              </div>
              {order.user?.phone && (
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('profile.phone_number')}</span>
                  <p className="text-sm">{order.user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              {t('payment.payment_method')}
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">{t('payment.payment_method')}</span>
                <p className="text-sm capitalize">{order.paymentMethod || 'Not specified'}</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-2">{t('orders.payment_status')}</span>
                <div className="flex items-center space-x-1">
                  {getPaymentStatusIcon(order.paymentStatus)}
                  <span className="text-sm capitalize">{order.paymentStatus || 'pending'}</span>
                </div>
              </div>
              {order.transactionId && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                  <p className="text-sm font-mono">{order.transactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {t('orders.shipping_address')}
            </h4>
            <div className="text-sm text-gray-700">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            {t('orders.order_items')} ({order.items?.length || 0})
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.product')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.vendor')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.quantity')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.price')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('orders.subtotal')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Product'}
                          </p>
                          {item.product?.sku && (
                            <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {item.product?.vendor?.storeName || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{item.quantity}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatCurrency(item.price || 0)}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">{t('cart.order_summary')}</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.subtotal')}</span>
              <span>{formatCurrency(order.subtotal || 0)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.tax')}</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
              <span>{t('cart.total')}</span>
              <span>{formatCurrency(order.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        {order.timeline && order.timeline.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Order Timeline
            </h4>
            <div className="space-y-3">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
          {order.status === 'pending' && (
            <Button
              variant="primary"
              onClick={() => {
              }}
            >
              {t('orders.update_status')}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};