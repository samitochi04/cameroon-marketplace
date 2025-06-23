import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, AlertCircle, Smartphone, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import axios from "axios"; // Use axios directly
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

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
  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    const rawPhone = paymentInfo?.mobileNumber || user.phone || '';
    const cleanedPhone = rawPhone.replace(/\D/g, '');
    const finalPhone = cleanedPhone.startsWith('237') 
      ? cleanedPhone 
      : `237${cleanedPhone}`;
    
    try {
      // Get the auth token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }
      
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
            payment_method: selectedPaymentMethod
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

      if (response.data.success) {
        setPaymentData(response.data.data);
        startStatusChecking(response.data.data.reference);
      } else {
        setError(response.data.message || "Failed to initiate payment");
      }
      
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError(error.response?.data?.message || error.message || "Failed to initiate payment");
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
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/status/${reference}`
        );
        
        if (response.data.success) {
          const status = response.data.data.status;
          
          if (status === 'SUCCESSFUL') {
            clearInterval(interval);
            setCheckingStatus(false);
            if (onSuccess) {
              onSuccess(response.data.data);
            }
            navigate(`/order-confirmation/${orderId}`);
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            clearInterval(interval);
            setCheckingStatus(false);
            setError(`Payment ${status.toLowerCase()}`);
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
        setError('Payment verification timeout. Please check your transaction status.');
      }
    }, 600000);
  };

  const manualStatusCheck = async () => {
    if (!paymentData?.reference) return;
    
    setCheckingStatus(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/status/${paymentData.reference}`
      );
      
      if (response.data.success) {
        const status = response.data.data.status;
        
        if (status === 'SUCCESSFUL') {
          if (onSuccess) {
            onSuccess(response.data.data);
          }
          navigate(`/order-confirmation/${orderId}`);
        } else if (status === 'FAILED' || status === 'CANCELLED') {
          setError(`Payment ${status.toLowerCase()}`);
        } else {
          setError('Payment is still pending. Please complete the transaction on your mobile device.');
        }
      }    } catch (statusError) {
      console.error('Error checking payment status:', statusError);
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
          <div className="flex flex-col space-y-2">
            <p className="text-sm">
              <span className="font-medium">{t("selected_payment_method")}: </span>
              {selectedPaymentMethod === "mtn_mobile_money" && "MTN Mobile Money"}
              {selectedPaymentMethod === "orange_money" && "Orange Money"}
            </p>
            
            <Button
              onClick={initiatePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? t("processing") : t("proceed_to_payment")}
            </Button>
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
                <span className="font-medium text-blue-800">Complete Payment on Your Phone</span>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <p>1. Check your mobile phone for payment notification</p>
                <p>2. Enter your mobile money PIN to complete the payment</p>
                <p>3. Wait for confirmation</p>
                {paymentData.ussd_code && (
                  <p>4. Or dial <strong>{paymentData.ussd_code}</strong> on your phone</p>
                )}
              </div>
            </div>

            {checkingStatus && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2 animate-pulse" />
                  <span className="font-medium text-yellow-800">Waiting for payment confirmation...</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  We're checking your payment status. This may take a few moments.
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
