import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CampayCheckout } from '@/components/payment/CampayCheckout';

export const PaymentPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Get order details from navigation state
  const orderDetails = location.state || {};
  const { amount, paymentMethod, customerInfo } = orderDetails;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, navigate]);

  // Redirect if no order details
  useEffect(() => {
    if (!orderId || !amount) {
      navigate('/cart');
    }
  }, [orderId, amount, navigate]);

  const handlePaymentSuccess = (paymentData) => {
    setPaymentCompleted(true);
    // Redirect to order confirmation after a short delay
    setTimeout(() => {
      navigate(`/order-confirmation/${orderId}`);
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // You could show an error message here
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (paymentCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">
            {t('payment_successful')}
          </h1>
          <p className="text-gray-600 mb-4">
            {t('payment_success_message')}
          </p>
          <p className="text-sm text-gray-500">
            {t('redirecting_to_confirmation')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-4"
        >
          {t('go_back')}
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">{t('complete_payment')}</h1>
        <p className="text-gray-600">
          {t('order_number')}: #{orderId?.slice(-8)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <CampayCheckout
            amount={amount}
            orderId={orderId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            selectedPaymentMethod={paymentMethod}
            paymentInfo={customerInfo}
          />
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('payment_summary')}</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('order_total')}</span>
                <span className="font-semibold">{formatCurrency(amount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>{t('payment_method')}</span>
                <span>
                  {paymentMethod === 'mtn_mobile_money' && 'MTN Mobile Money'}
                  {paymentMethod === 'orange_money' && 'Orange Money'}
                  {paymentMethod === 'credit_card' && t('credit_card')}
                </span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <p className="text-sm text-gray-600">
                  {t('payment_security_note')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;