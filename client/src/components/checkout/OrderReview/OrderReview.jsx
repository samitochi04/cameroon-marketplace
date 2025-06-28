import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { MapPin, CreditCard, Truck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const OrderReview = ({ 
  shippingAddress, 
  billingAddress, 
  shippingMethod,
  paymentMethod
}) => {
  const { t } = useTranslation();
  const { cartItems, subtotal, shipping, discount, total, appliedPromo } = useCart();
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const getShippingMethodName = () => {
    switch(shippingMethod) {
      case 'express':
        return t('express_shipping', 'Express Shipping');
      case 'pickup':
        return t('store_pickup', 'Store Pickup');
      default:
        return t('standard_shipping', 'Standard Shipping');
    }
  };
  
  const getPaymentMethodName = () => {
    switch(paymentMethod) {
      case 'mtn_mobile_money':
        return 'MTN Mobile Money';
      case 'orange_money':
        return 'Orange Money';
      case 'credit_card':
        return t('credit_card', 'Credit/Debit Card');
      case 'cod':
        return t('cash_on_delivery', 'Cash on Delivery');
      default:
        return paymentMethod;
    }
  };

  const getPaymentMethodDescription = () => {
    switch(paymentMethod) {
      case 'mtn_mobile_money':
        return t('mtn_mobile_money_description', 'Pay securely with MTN Mobile Money');
      case 'orange_money':
        return t('orange_money_description', 'Pay securely with Orange Money');
      case 'credit_card':
        return t('credit_card_description', 'Pay securely with your credit/debit card');
      case 'cod':
        return t('cod_payment_description', 'Pay when your order is delivered');
      default:
        return t('online_payment_note', 'You will be redirected to complete your payment securely');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('order_review', 'Order Review')}</h2>
        <p className="text-gray-500">{t('review_order_before_payment', 'Please review your order before proceeding to payment')}</p>
      </div>
      
      {/* Order Items */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">{t('order_items', 'Order Items')}</h3>
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h4 className="line-clamp-1">{item.name}</h4>
                  <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <p>{t('quantity', 'Quantity')}: {item.quantity}</p>
                  <p>{t('price_per_item', 'Price per item')}: {formatCurrency(item.price)}</p>
                </div>
                {item.variant && (
                  <p className="mt-1 text-sm text-gray-500">
                    {Object.entries(item.variant).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <MapPin className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">{t('shipping_address')}</h3>
          </div>
          
          <div className="text-sm">
            <p className="font-medium">{shippingAddress.fullName}</p>
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}, {shippingAddress.region}</p>
            <p>{shippingAddress.phoneNumber}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">{t('billing_address')}</h3>
          </div>
          
          <div className="text-sm">
            <p className="font-medium">{billingAddress.fullName}</p>
            <p>{billingAddress.address}</p>
            <p>{billingAddress.city}, {billingAddress.region}</p>
            <p>{billingAddress.phoneNumber}</p>
          </div>
        </Card>
      </div>
      
      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <Truck className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">{t('shipping_method')}</h3>
          </div>
          
          <p>{getShippingMethodName()}</p>
          <p className="text-sm text-gray-500 mt-1">
            {shippingMethod === 'express' 
              ? t('delivery_time_express', { days: '1-2' })
              : shippingMethod === 'pickup'
              ? t('pickup_time', { hours: 24 }) 
              : t('delivery_time_standard', { days: '3-5' })
            }
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center mb-2">
            <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">{t('payment_method')}</h3>
          </div>
          
          <p className="font-medium">{getPaymentMethodName()}</p>
          <p className="text-sm text-gray-500 mt-1">
            {getPaymentMethodDescription()}
          </p>
        </Card>
      </div>
      
      {/* Order Summary */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">{t('order_summary')}</h3>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('subtotal')}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                {appliedPromo ? `${t('discount')} (${appliedPromo.code})` : t('discount')}
              </span>
              <span className="text-green-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('shipping')}</span>
            <span>{shipping > 0 ? formatCurrency(shipping) : t('free')}</span>
          </div>
          
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('tax')}</span>
            <span>{formatCurrency(tax)}</span>
          </div> */}
          
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-medium">
            <span>{t('total')}</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
