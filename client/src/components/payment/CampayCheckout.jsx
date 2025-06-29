import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, AlertCircle, Smartphone, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import axios from "axios"; // Use axios directly
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-toastify';

export const CampayCheckout = ({ 
  amount, 
  orderId, 
  vendor_id, 
  onSuccess, 
  onError, 
  selectedPaymentMethod,
  paymentInfo
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [detectedOperator, setDetectedOperator] = useState(null);

  // Function to detect operator based on phone number
  const detectOperator = (phoneNumber) => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    let phoneToCheck = cleanedPhone;
    
    // Remove country code if present
    if (phoneToCheck.startsWith('237')) {
      phoneToCheck = phoneToCheck.substring(3);
    }
    
    // Must be at least 8 digits after country code
    if (phoneToCheck.length < 8) {
      return null;
    }
    
    // Check first two digits for operator detection
    const firstTwoDigits = phoneToCheck.substring(0, 2);
    const firstDigit = phoneToCheck.substring(0, 1);
    
    // MTN prefixes: 50-54, 65, 67, 68, 7, 8
    if (['50', '51', '52', '53', '54', '65', '67', '68'].includes(firstTwoDigits) || ['7', '8'].includes(firstDigit)) {
      return 'MTN';
    }
    
    // Orange prefixes: 55-59, 69, 9
    if (['55', '56', '57', '58', '59', '69'].includes(firstTwoDigits) || firstDigit === '9') {
      return 'ORANGE';
    }
    
    return null;
  };

  // Handle mobile number input changes
  const handleMobileNumberChange = (value) => {
    setMobileNumber(value);
    const operator = detectOperator(value);
    setDetectedOperator(operator);
  };

  // Initialize mobile number from props or user data
  useEffect(() => {
    const initialPhone = paymentInfo?.mobileNumber || user?.phone || '';
    if (initialPhone) {
      handleMobileNumberChange(initialPhone);
    }
  }, [paymentInfo?.mobileNumber, user?.phone]);
  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    // Use the mobile number from the input field
    const rawPhone = mobileNumber || paymentInfo?.mobileNumber || user.phone || '';
    const cleanedPhone = rawPhone.replace(/\D/g, '');
    const finalPhone = cleanedPhone.startsWith('237') 
      ? cleanedPhone 
      : `237${cleanedPhone}`;
    
    // Validate phone number
    if (!rawPhone || cleanedPhone.length < 8) {
      setError('Please enter a valid phone number');
      toast.error('Please enter a valid phone number', { autoClose: 5000 });
      setLoading(false);
      return;
    }

    // Detect operator - if detection fails, show an error
    let operator = detectOperator(finalPhone);
    if (!operator) {
      setError('Please enter a valid MTN (50-54, 65, 67, 68, 7, 8) or Orange (55-59, 69, 9) number.');
      toast.error('Please enter a valid MTN (50-54, 65, 67, 68, 7, 8) or Orange (55-59, 69, 9) number.', { autoClose: 5000 });
      setLoading(false);
      return;
    }
    
    console.log('Formatted phone number for payment:', finalPhone);
    console.log('Detected operator:', operator);
    
    try {
      // Get the auth token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
      toast.info(`Initiating ${operator} Mobile Money payment, please wait...`, {
        autoClose: 3000
      });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/initialize`,
        {
          amount,
          customer: {
            id: user.id,
            name: user.displayName || user.email,
            email: user.email,
            phone: finalPhone,
            address: user.address || '',
            city: user.city || '',
            country: 'CM',
          },
          description: `Payment for order #${orderId}`,
          metadata: {
            order_id: orderId,
            payment_method: operator.toLowerCase() + '_mobile_money',
            operator: operator
          },
          vendor_id
        },
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`, // Add auth header
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment initialization response:', response.data);

      if (response.data.success) {
        setPaymentData(response.data.data);
        console.log('Starting status checking for reference:', response.data.data.reference);
        toast.success('Payment initiated successfully! Please check your phone for the mobile money notification.', {
          autoClose: 7000
        });
        startStatusChecking(response.data.data.reference);
      } else {
        const errorMessage = response.data.message || "Failed to initiate payment";
        setError(errorMessage);
        toast.error(errorMessage, {
          autoClose: 5000
        });
      }
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to initiate payment";
      setError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000
      });
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const startStatusChecking = (reference) => {
    setCheckingStatus(true);
    
    // Check payment status every 5 seconds
    const interval = setInterval(async () => {
      try {
        // Get auth token for authenticated request
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No auth token available for payment status check');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/status/${reference}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Payment status check response:', response.data);
        
        if (response.data.success) {
          const status = response.data.data.status;
          console.log('Payment status:', status);
          
          if (status === 'SUCCESSFUL') {
            clearInterval(interval);
            setCheckingStatus(false);
            
            // Show success notification
            toast.success(' Payment successful! Your order has been confirmed. Redirecting...', {
              autoClose: 6000
            });
            
            // Send payment verification with order data for order creation
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.access_token) {
                // Get pending order data from localStorage
                const pendingOrderData = localStorage.getItem('pendingOrder');
                const orderData = pendingOrderData ? JSON.parse(pendingOrderData) : null;
                
                const verificationPayload = { 
                  reference: response.data.data.reference
                };
                
                console.log('Preparing verification with reference:', response.data.data.reference);
                
                // If we have order data, include it so the order is created after payment
                if (orderData) {
                  console.log('Adding order data to verification payload');
                  verificationPayload.orderData = {
                    userId: user.id,
                    items: orderData.items || [],
                    shippingAddress: orderData.shippingAddress || {},
                    billingAddress: orderData.billingAddress || orderData.shippingAddress || {},
                    shippingMethod: orderData.shippingMethod || 'standard',
                    paymentMethod: detectedOperator ? `${detectedOperator.toLowerCase()}_mobile_money` : 'mobile_money',
                    subtotal: orderData.subtotal || 0,
                    shipping: orderData.shipping || 0,
                    totalAmount: orderData.amount || amount
                  };
                }
                
                console.log('Sending payment verification request:', verificationPayload);
                
                const verifyResponse = await axios.post(
                  `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/verify`,
                  verificationPayload,
                  {
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                if (verifyResponse.data.success && verifyResponse.data.data.order) {
                  // Clear pending order from localStorage since order is now created
                  localStorage.removeItem('pendingOrder');
                  
                  // Navigate to order confirmation with the actual order ID
                  navigate(`/order-confirmation/${verifyResponse.data.data.order.id}`);
                  return;
                }
              }
            } catch (verificationError) {
              console.error('Error verifying payment:', verificationError);
              // Continue with the normal flow even if verification fails
            }
            
            if (onSuccess) {
              onSuccess(response.data.data);
            }
            navigate(`/order-confirmation/${orderId}`);
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            clearInterval(interval);
            setCheckingStatus(false);
            const errorMessage = `Payment ${status.toLowerCase()}. Please try again.`;
            setError(errorMessage);
            toast.error(`❌ ${errorMessage}`, {
              autoClose: 6000
            });
          }
          // Continue checking if status is PENDING
        }      } catch (statusError) {
        console.error('Error checking payment status:', statusError);
      }
    }, 5000);

    setStatusCheckInterval(interval);
    
    // Stop checking after 10 minutes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setCheckingStatus(false);
        const timeoutMessage = 'Payment verification timeout. Please check your transaction status or try again.';
        setError(timeoutMessage);
        toast.warning(timeoutMessage, {
          autoClose: 8000
        });
      }
    }, 600000);
  };

  const manualStatusCheck = async () => {
    if (!paymentData?.reference) return;
    
    setCheckingStatus(true);
    try {
      // Get auth token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No auth token available for manual payment status check');
        setCheckingStatus(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/status/${paymentData.reference}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const status = response.data.data.status;
        
        if (status === 'SUCCESSFUL') {
          toast.success('🎉 Payment successful! Your order has been confirmed. Redirecting...', {
            autoClose: 6000
          });
          
          // Send payment verification with order data for order creation
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              // Get pending order data from localStorage
              const pendingOrderData = localStorage.getItem('pendingOrder');
              const orderData = pendingOrderData ? JSON.parse(pendingOrderData) : null;
              
              const verificationPayload = { 
                reference: paymentData.reference
              };
              
              // If we have order data, include it so the order is created after payment
              if (orderData) {
                verificationPayload.orderData = {
                  userId: user.id,
                  items: orderData.items || [],
                  shippingAddress: orderData.shippingAddress || {},
                  billingAddress: orderData.billingAddress || orderData.shippingAddress || {},
                  shippingMethod: orderData.shippingMethod || 'standard',
                  paymentMethod: detectedOperator ? `${detectedOperator.toLowerCase()}_mobile_money` : 'mobile_money',
                  subtotal: orderData.subtotal || 0,
                  shipping: orderData.shipping || 0,
                  totalAmount: orderData.amount || amount
                };
              }
              
              const verifyResponse = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/verify`,
                verificationPayload,
                {
                  headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (verifyResponse.data.success && verifyResponse.data.data.order) {
                // Clear pending order from localStorage since order is now created
                localStorage.removeItem('pendingOrder');
                
                // Navigate to order confirmation with the actual order ID
                navigate(`/order-confirmation/${verifyResponse.data.data.order.id}`);
                return;
              }
            }
          } catch (verificationError) {
            console.error('Error verifying payment:', verificationError);
            // Continue with the normal flow even if verification fails
          }
          if (onSuccess) {
            onSuccess(response.data.data);
          }
          navigate(`/order-confirmation/${orderId}`);
        } else if (status === 'FAILED' || status === 'CANCELLED') {
          const errorMessage = `Payment ${status.toLowerCase()}. Please try again.`;
          setError(errorMessage);
          toast.error(`❌ ${errorMessage}`, {
            autoClose: 6000
          });
        } else {
          toast.info('⏳ Payment is still pending. Please complete the transaction on your mobile device.', {
            autoClose: 4000
          });
          setError('Payment is still pending. Please complete the transaction on your mobile device.');
        }
      }
    } catch (statusError) {
      console.error('Error checking payment status:', statusError);
      toast.error('Failed to check payment status', {
        autoClose: 3000
      });
      setError('Failed to check payment status');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const getOperatorName = (operator) => {
    switch(operator) {
      case 'MTN':
        return 'MTN Mobile Money';
      case 'Orange':
        return 'Orange Money';
      default:
        return operator || 'Mobile Money';
    }
  };

  return (
    <Card className="p-6 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">{t("complete_payment")}</h3>
            <p className="text-gray-500 text-sm">{t("amount")}: {amount} XAF</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <Smartphone className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!paymentData ? (
          <div className="flex flex-col space-y-4">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mobile Money Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => handleMobileNumberChange(e.target.value)}
                  placeholder="e.g., 6XXXXXXXX or 237XXXXXXXX"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {detectedOperator && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      detectedOperator === 'MTN' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {detectedOperator}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Enter your phone number without the country code. 
                {detectedOperator 
                  ? ` Detected: ${detectedOperator} Mobile Money`
                  : ' MTN: 50-54, 65, 67, 68, 7, 8 | Orange: 55-59, 69, 9'
                }
              </p>
            </div>

            {/* Payment Method Display */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {detectedOperator ? `${detectedOperator} Mobile Money` : 'Mobile Money Payment'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {detectedOperator 
                      ? `Pay securely using ${detectedOperator} mobile money`
                      : 'Supports both MTN and Orange Mobile Money'
                    }
                  </p>
                </div>
                {detectedOperator && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    detectedOperator === 'MTN' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {detectedOperator}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="font-medium text-blue-900">{amount} XAF</span>
                </div>
                {detectedOperator && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payment Method:</span>
                    <span className="font-medium text-blue-900">{detectedOperator} Mobile Money</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              onClick={initiatePayment}
              disabled={loading || !mobileNumber || mobileNumber.replace(/\D/g, '').length < 8}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("processing")}
                </div>
              ) : (
                `Pay ${amount} XAF with ${detectedOperator || 'Mobile Money'}`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Your payment information is encrypted and secure. We never store your payment details.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Payment Initiated</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Reference:</strong> {paymentData.reference}</p>
                <p><strong>Operator:</strong> {getOperatorName(paymentData.operator)}</p>
                {paymentData.ussd_code && (
                  <p><strong>USSD Code:</strong> {paymentData.ussd_code}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">📱 Complete Payment on Your Phone</span>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Step 1:</strong> Check your mobile phone for a payment notification</p>
                <p><strong>Step 2:</strong> Enter your mobile money PIN to authorize the payment</p>
                <p><strong>Step 3:</strong> Wait for payment confirmation</p>
                {paymentData.ussd_code && (
                  <p><strong>Alternative:</strong> Dial <strong>{paymentData.ussd_code}</strong> on your phone</p>
                )}
                <div className="mt-3 p-2 bg-blue-100 rounded">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> Make sure you have sufficient balance and complete the payment within 5 minutes.
                  </p>
                </div>
              </div>
            </div>

            {checkingStatus && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2 animate-pulse" />
                  <span className="font-medium text-yellow-800">⏳ Waiting for payment confirmation...</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  We're checking your payment status automatically. Please complete the transaction on your mobile device.
                </p>
              </div>
            )}

            <Button
              onClick={manualStatusCheck}
              disabled={checkingStatus}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${checkingStatus ? 'animate-spin' : ''}`} />
              {checkingStatus ? 'Checking Status...' : 'Check Payment Status'}
            </Button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          {t("secure_payment_message")}
        </p>
      </div>
    </Card>
  );
};
