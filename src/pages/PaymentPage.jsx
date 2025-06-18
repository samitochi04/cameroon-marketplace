import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader, AlertCircle, CreditCard, Smartphone, SmartphoneNfc } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '../services/orderService';
import { Button } from '@/components/ui/Button';
import { CinetpayCheckout } from '@/components/payment/CinetpayCheckout';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    mobileNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  
  // Get selected payment method from localStorage or default to 'mtn_mobile_money'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    localStorage.getItem('selectedPaymentMethod') || 'mtn_mobile_money'
  );

  // Handle payment info input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Fetch order details
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        
        // Set payment method from order if available
        if (orderData && orderData.paymentMethod) {
          setSelectedPaymentMethod(orderData.paymentMethod);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(t('failed_to_load_order'));
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, t]);

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'mtn_mobile_money':
        return <SmartphoneNfc className="h-6 w-6" />;
      case 'orange_money':
        return <Smartphone className="h-6 w-6" />;
      case 'credit_card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };
  
  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'mtn_mobile_money':
        return 'MTN Mobile Money';
      case 'orange_money':
        return 'Orange Money';
      case 'credit_card':
        return t('credit_card');
      default:
        return method;
    }
  };

  // After payment is successful
  const handlePaymentSuccess = async () => {
    // Retrieve order data from localStorage
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));
    if (pendingOrder) {
      try {
        // Send order to backend with status "pending"
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders`,
          { ...pendingOrder, status: 'pending' }
        );
        // Clear pending order from storage
        localStorage.removeItem('pendingOrder');
      } catch (err) {
        // Optionally handle error (show message, etc)
      }
    }
    // Redirect to order confirmation
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || t('payment_failed'));
  };
  
  // Validate payment information before proceeding
  const validatePaymentInfo = () => {
    if (selectedPaymentMethod === 'mtn_mobile_money' || selectedPaymentMethod === 'orange_money') {
      if (!paymentInfo.mobileNumber || paymentInfo.mobileNumber.length < 9) {
        return t('enter_valid_phone_number');
      }
    } else if (selectedPaymentMethod === 'credit_card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
        return t('enter_valid_card_number');
      }
      if (!paymentInfo.expiryDate) {
        return t('enter_valid_expiry_date');
      }
      if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
        return t('enter_valid_cvv');
      }
      if (!paymentInfo.cardholderName) {
        return t('enter_cardholder_name');
      }
    }
    return null;
  };
  
  const initiatePayment = () => {
  const validationError = validatePaymentInfo();
  if (validationError) {
    setError(validationError);
    return;
  }

  if (selectedPaymentMethod === 'mtn_mobile_money' || selectedPaymentMethod === 'orange_money') {
    const raw = paymentInfo.mobileNumber.trim();
    const cleaned = raw.replace(/\D/g, ''); // remove non-digits
    const formatted = cleaned.startsWith('237') ? `+${cleaned}` : `+237${cleaned}`;
    
    setPaymentInfo(prev => ({
      ...prev,
      mobileNumber: formatted
    }));
  }

  setPaymentInitiated(true);
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">{t('loading_order')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">{t('payment_error')}</h2>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex justify-between">
          <button 
            onClick={() => navigate('/cart')} 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('return_to_cart')}
          </button>
          <Button 
            onClick={() => {
              setError(null);
              setPaymentInitiated(false);
            }}
            variant="primary"
          >
            {t('try_again')}
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{t('order_not_found')}</h2>
        <p className="text-gray-600 mb-6">{t('order_not_found_message')}</p>
        <button 
          onClick={() => navigate('/cart')} 
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          {t('return_to_cart')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto my-12">
      <h2 className="text-2xl font-semibold mb-6">{t('complete_your_payment')}</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            {getPaymentMethodIcon(selectedPaymentMethod)}
            <h3 className="ml-2 text-lg font-medium">
              {getPaymentMethodName(selectedPaymentMethod)}
            </h3>
          </div>
          <p className="text-gray-500 mt-1">
            {t('payment_method_description')}
          </p>
        </div>
        
        <div className="p-6">
          {paymentInitiated ? (
            <CinetpayCheckout 
              amount={order.totalAmount}
              orderId={order.id}
              vendor_id={order.vendor_id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              selectedPaymentMethod={selectedPaymentMethod}
              paymentInfo={paymentInfo}
            />
          ) : (
            <>
              {(selectedPaymentMethod === 'mtn_mobile_money' || selectedPaymentMethod === 'orange_money') && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mobile_number')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="mobileNumber"
                      value={paymentInfo.mobileNumber}
                      onChange={handleChange}
                      placeholder="e.g., 6XXXXXXXX"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPaymentMethod === 'mtn_mobile_money'
                        ? t('mtn_number_hint', 'Enter your MTN number without the country code')
                        : t('orange_number_hint', 'Enter your Orange number without the country code')}
                    </p>
                  </div>
                </div>
              )}
              
              {selectedPaymentMethod === 'credit_card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('card_number')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handleChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('expiry_date')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('cvv')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handleChange}
                        placeholder="XXX"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cardholder_name')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="cardholderName"
                      value={paymentInfo.cardholderName}
                      onChange={handleChange}
                      placeholder={t('name_on_card')}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              <Button
                variant="primary"
                className="w-full mb-4"
                onClick={initiatePayment}
              >
                {t('proceed_to_payment')}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                {t('secure_payment_note')}
              </p>
            </>
          )}
          
          <div className="flex flex-col space-y-3 text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span>{t('order_id')}</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span>{t('payment_method')}</span>
              <span className="font-medium">{getPaymentMethodName(selectedPaymentMethod)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>{t('amount')}</span>
              <span className="font-medium">{
                new Intl.NumberFormat('fr-CM', {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 0
                }).format(order.totalAmount)
              }</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          variant="outline"
          onClick={() => navigate('/account/orders')}
          className="mx-auto"
        >
          {t('view_your_orders')}
        </Button>
      </div>
    </div>
  );
};

export default PaymentPage;
