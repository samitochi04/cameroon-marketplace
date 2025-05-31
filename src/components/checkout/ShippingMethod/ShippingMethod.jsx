import React from 'react';
import { Truck, Package } from 'lucide-react';

export const ShippingMethod = ({ selectedMethod, onSelectMethod }) => {
  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 2000,
      description: '3-5 business days',
      icon: <Truck className="h-5 w-5" />
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 5000,
      description: '1-2 business days',
      icon: <Package className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Shipping Method</h2>
      <div className="space-y-3">
        {shippingMethods.map((method) => (
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
                  <span className="font-semibold">{new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(method.price)}</span>
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

export default ShippingMethod;
