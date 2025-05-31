import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader, AlertCircle } from 'lucide-react';
import { koraPayService } from '../services/koraPayService';
import { orderService } from '../services/orderService';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    // Fetch order details
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        
        // Auto-initiate payment if order is found and pending payment
        if (orderData && orderData.paymentStatus === 'pending') {
          initiatePayment(orderData);
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

  const initiatePayment = async (orderData) => {
    try {
      setPaymentInitiated(true);
      
      // Initialize Kora Pay
      await koraPayService.initializeKora();
      
      // Create transaction
      const paymentData = await koraPayService.createTransaction({
        amount: orderData.totalAmount,
        orderId: orderData.id,
        customerName: orderData.shippingAddress.fullName,
        customerEmail: orderData.user.email,
        customerPhone: orderData.shippingAddress.phoneNumber,
      });
      
      // Register callbacks
      koraPayService.registerCallbacks({
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError,
        onClose: handlePaymentClose
      });
      
      // Open payment modal
      koraPayService.openPaymentModal(paymentData.transactionId);
      
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setError(t('payment_initiation_failed'));
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Verify payment on server
      const result = await koraPayService.verifyPayment(orderId, response.transactionId);
      
      if (result.success) {
        // Redirect to order confirmation
        navigate(`/order-confirmation/${orderId}`);
      } else {
        setError(t('payment_verification_failed'));
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(t('payment_verification_error'));
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || t('payment_failed'));
  };

  const handlePaymentClose = () => {
    // Handle when user closes payment modal without completing payment
    console.log('Payment modal closed');
  };

  const retryPayment = () => {
    if (order) {
      initiatePayment(order);
    }
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
          <button 
            onClick={retryPayment} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {t('retry_payment')}
          </button>
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
    <div className="max-w-lg mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">{t('processing_payment')}</h2>
      
      {!paymentInitiated ? (
        <div className="text-center">
          <p className="text-gray-600 mb-6">{t('initiating_payment')}</p>
          <button 
            onClick={() => initiatePayment(order)} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {t('pay_now')}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('payment_processing_message')}</p>
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{t('order_number')}:</span>
          <span className="font-medium">{order.id}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{t('amount')}:</span>
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
  );
};

export default PaymentPage;
