import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { koraPayService } from '@/services/koraPayService';

export const KoraPayment = ({ 
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Format the amount for display
  const formattedAmount = new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount);
  
  // Initialize Kora SDK on component mount
  useEffect(() => {
    const initKora = async () => {
      try {
        await koraPayService.initializeKora();
        setInitializing(false);
      } catch (error) {
        console.error('Failed to initialize Kora Pay:', error);
        setError(t('kora_initialization_failed'));
        setInitializing(false);
        
        if (onError) {
          onError(error);
        }
      }
    };
    
    initKora();
    
    // Clean up on unmount
    return () => {
      koraPayService.cleanup();
    };
  }, [t, onError]);
  
  // Handle payment initiation
  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create payment transaction
      const paymentData = await koraPayService.createTransaction({
        amount,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
      });
      
      // Register callback handlers
      koraPayService.registerCallbacks({
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError,
        onClose: handlePaymentClose
      });
      
      // Open payment modal
      koraPayService.openPaymentModal(paymentData.transactionId);
      
      setPaymentInitiated(true);
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setError(error.message || t('payment_initiation_failed'));
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful payment
  const handlePaymentSuccess = async (response) => {
    setPaymentStatus('success');
    
    try {
      // Verify the payment on our server
      const verificationResult = await koraPayService.verifyPayment(
        orderId, 
        response.transactionId
      );
      
      if (verificationResult.success) {
        // Call the success callback from parent
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        // Payment verification failed, show error
        setError(t('payment_verification_failed'));
        setPaymentStatus('error');
        
        if (onError) {
          onError(new Error('Payment verification failed'));
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(t('payment_verification_error'));
      setPaymentStatus('error');
      
      if (onError) {
        onError(error);
      }
    }
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || t('payment_failed'));
    setPaymentStatus('error');
    
    if (onError) {
      onError(error);
    }
  };
  
  // Handle payment modal close (without completion)
  const handlePaymentClose = () => {
    if (!paymentStatus) {
      setError(t('payment_cancelled'));
      setPaymentStatus('cancelled');
    }
  };
  
  // If we're still initializing, show loading state
  if (initializing) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>{t('initializing_payment')}</p>
        </div>
      </Card>
    );
  }
  
  // If we encountered an initialization error, show error
  if (error && !paymentInitiated) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center py-8">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('payment_initialization_failed')}</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            {t('try_again')}
          </Button>
        </div>
      </Card>
    );
  }
  
  // Show payment status if payment was processed
  if (paymentStatus) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center py-8">
          {paymentStatus === 'success' ? (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('payment_successful')}</h3>
              <p className="text-gray-600">{t('processing_order')}</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {paymentStatus === 'cancelled' ? t('payment_cancelled') : t('payment_failed')}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleInitiatePayment} variant="outline">
                {t('try_again')}
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  }
  
  // Show payment form
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('secure_payment')}</h3>
          <p className="text-gray-500">{t('kora_payment_description')}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">{t('order_total')}</span>
            <span className="font-semibold text-lg">{formattedAmount}</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <img 
            src="/kora-pay-logo.png" 
            alt="Kora Pay" 
            className="h-8 object-contain" 
          />
        </div>
        
        <Button
          onClick={handleInitiatePayment}
          className="w-full"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              {t('processing')}
            </span>
          ) : t('proceed_to_payment')}
        </Button>
        
        <p className="text-xs text-center text-gray-500">
          {t('secure_payment_notice')}
        </p>
      </div>
    </Card>
  );
};
