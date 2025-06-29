import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SmartphoneNfc, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const PaymentMethod = ({ selectedMethod, onSelectMethod, total }) => {
  const { t } = useTranslation();
  
  // Add state for payment information
  const [paymentInfo, setPaymentInfo] = useState({
    mobileNumber: '',
  });
  
  // Handle payment info changes
  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Payment method options - Only MTN and Orange Money (removed credit card)
  const paymentOptions = [
    { 
      id: 'mtn_mobile_money', 
      name: 'MTN Mobile Money', 
      description: t('mtn_mobile_money_description', 'Pay securely using MTN Mobile Money'),
      icon: SmartphoneNfc
    },
    { 
      id: 'orange_money', 
      name: 'Orange Money', 
      description: t('orange_money_description', 'Pay securely using Orange Money'),
      icon: Smartphone
    }
  ];
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('payment_method', 'Payment Method')}</h2>
      
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
              
              {/* Show payment form fields when this method is selected */}
              {selectedMethod === option.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">
                      {option.id === 'mtn_mobile_money' 
                        ? t('enter_mtn_number', 'Enter your MTN Mobile Money number')
                        : t('enter_orange_number', 'Enter your Orange Money number')}
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('mobile_number', 'Mobile Number')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        name="mobileNumber"
                        placeholder="e.g., 6XXXXXXXX"
                        value={paymentInfo.mobileNumber}
                        onChange={handlePaymentInfoChange}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('mobile_number_hint', 'Enter your phone number without the country code')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">{t('payment_summary', 'Payment Summary')}</h3>
        <div className="flex justify-between text-sm mb-2">
          <span>{t('total_amount', 'Total Amount')}</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>{t('payment_method', 'Payment Method')}</span>
          <span className="font-semibold">
            {selectedMethod === 'mtn_mobile_money' && 'MTN Mobile Money'}
            {selectedMethod === 'orange_money' && 'Orange Money'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {t('payment_confirmation_note', 'You will confirm this payment after placing your order')}
        </p>
      </div>
      
      <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          {t('payment_security_note', 'Your payment information is encrypted and secure. We never store your payment details.')}
        </p>
      </div>
    </div>
  );
};
