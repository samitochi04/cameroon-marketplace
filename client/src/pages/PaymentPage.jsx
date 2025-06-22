import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader, AlertCircle, Smartphone, SmartphoneNfc } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '../services/orderService';
import { Button } from '@/components/ui/Button';
import { CampayCheckout } from '@/components/payment/CampayCheckout';
import { Input } from '@/components/ui/Input';

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
    // Fetch order details or use pending order data
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        // Try to get pending order from localStorage first
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder);
          setOrder({
            id: orderId,
            totalAmount: orderData.amount,
            paymentMethod: selectedPaymentMethod
          });
          
          // Pre-fill phone number if available
          if (orderData.customer?.phone) {
            setPaymentInfo(prev => ({
              ...prev,
              mobileNumber: orderData.customer.phone.replace('237', '')
            }));
          }
        } else {
          // Fallback to API call
          const orderData = await orderService.getOrderById(orderId);
          setOrder(orderData);
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
  }, [orderId, t, selectedPaymentMethod]);

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'mtn_mobile_money':
        return <SmartphoneNfc className="h-6 w-6" />;
      case 'orange_money':
        return <Smartphone className="h-6 w-6" />;
      default:
        return <Smartphone className="h-6 w-6" />;
    }
  };
  
  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'mtn_mobile_money':
        return 'MTN Mobile Money';
      case 'orange_money':
        return 'Orange Money';
      default:
        return method;
    }
  };

  // After payment is successful
  const handlePaymentSuccess = async (paymentData) => {
    // Clear pending order from storage
    localStorage.removeItem('pendingOrder');
    
    // Redirect to order confirmation
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || t('payment_failed'));
  };
  
  // Validate payment information before proceeding
  const validatePaymentInfo = () => {
    if (!paymentInfo.mobileNumber || paymentInfo.mobileNumber.length < 8) {
      return t('enter_valid_phone_number');
    }
    return null;
  };
  
  const initiatePayment = () => {
    const validationError = validatePaymentInfo();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Format phone number for Campay (should start with 237)
    const raw = paymentInfo.mobileNumber.trim();
    const cleaned = raw.replace(/\D/g, ''); // remove non-digits
    const formatted = cleaned.startsWith('237') ? cleaned : `237${cleaned}`;
    
    setPaymentInfo(prev => ({
      ...prev,
      mobileNumber: formatted
    }));

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
            {t('campay_payment_description', 'Pay securely using mobile money')}
          </p>
        </div>
        
        <div className="p-6">
          {paymentInitiated ? (
            <CampayCheckout 
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
                      ? t('mtn_number_hint', 'Enter your MTN number without country code (237)')
                      : t('orange_number_hint', 'Enter your Orange number without country code (237)')}
                  </p>
                </div>
              </div>
              
              <Button
                variant="primary"
                className="w-full mb-4"
                onClick={initiatePayment}
              >
                {t('proceed_to_payment')}
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                {t('campay_secure_note', 'Your payment is processed securely through Campay')}
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
                      
