import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const PaymentMethod = ({ selectedMethod, onSelectMethod, total }) => {
  const { t } = useTranslation();
  
  // Payment method options
  const paymentOptions = [
    { 
      id: 'kora', 
      name: 'Kora Pay', 
      description: t('kora_payment_description'),
      icon: CreditCard
    },
    { 
      id: 'cod', 
      name: t('cash_on_delivery'), 
      description: t('cod_payment_description'),
      icon: DollarSign
    }
  ];
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('payment_method')}</h2>
      
      <div className="space-y-4 mb-6">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div 
              key={option.id}
              className={`
                border rounded-lg p-4 cursor-pointer
                ${selectedMethod === option.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => onSelectMethod(option.id)}
            >
              <div className="flex items-center">
                <div className={`
                  h-10 w-10 rounded-full flex items-center justify-center
                  ${selectedMethod === option.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <div className={`
                    h-6 w-6 rounded-full border-2
                    ${selectedMethod === option.id 
                      ? 'border-primary flex items-center justify-center' 
                      : 'border-gray-300'}
                  `}>
                    {selectedMethod === option.id && (
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Kora Pay Fields */}
      {selectedMethod === 'kora' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">{t('payment_details')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('kora_pay_instructions')}
          </p>
          
          <div className="mt-4 font-medium">
            {t('amount_to_pay')}: {formatCurrency(total)}
          </div>
        </div>
      )}
      
      {/* Cash on Delivery Fields */}
      {selectedMethod === 'cod' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-4">{t('cash_on_delivery')}</h3>
          <p className="text-sm text-gray-600">
            {t('cod_instructions')}
          </p>
          
          <div className="mt-4 font-medium">
            {t('amount_to_pay_on_delivery')}: {formatCurrency(total)}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          {t('payment_security_note')}
        </p>
      </div>
    </div>
  );
};
