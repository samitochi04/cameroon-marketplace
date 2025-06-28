import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, ShoppingBag, Home } from 'lucide-react';

export const DeliveryOptions = ({ selectedMethod, onSelectMethod }) => {
  const { t } = useTranslation();
  
  const deliveryMethods = [
    {
      id: 'standard',
      name: t('standard_shipping', 'Standard Shipping'),
      price: 0,
      description: t('delivery_time_standard', { days: '3-5' }, 'Delivery in 3-5 days'),
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'express',
      name: t('express_shipping', 'Express Shipping'),
      price: 0,
      description: t('delivery_time_express', { days: '1-2' }, 'Delivery in 1-2 days'),
      icon: <Home className="h-5 w-5" /> 
    },
    {
      id: 'pickup',
      name: t('store_pickup', 'Store Pickup'),
      price: 0,
      description: t('pickup_time', { hours: 24 }, 'Pickup in 24 hours'),
      icon: <ShoppingBag className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">{t('delivery_options', 'Delivery Options')}</h2>
      <div className="space-y-3">
        {deliveryMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-md p-4 cursor-pointer ${
              selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${
                selectedMethod === method.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
              }`}>
                {method.icon}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{method.name}</span>
                  <span className="font-semibold">
                    {method.price > 0 
                      ? new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(method.price)
                      : t('free', 'Free')}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryOptions;
