import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApiClient } from "@/utils/apiClient";
import { useAuth } from "@/context/AuthContext";

export const CinetpayCheckout = ({ 
  amount, 
  orderId, 
  vendorId, 
  onSuccess, 
  onError, 
  selectedPaymentMethod 
}) => {
  const { t } = useTranslation();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.post('/payments/initialize', {
        amount,
        customer: {
          id: user.id,
          name: user.displayName || user.email,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          country: 'CM',
        },
        description: `Payment for order #${orderId}`,
        metadata: {
          order_id: orderId,
          payment_method: selectedPaymentMethod
        },
        vendorId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If we have a payment URL, redirect to it
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        setPaymentUrl(response.data.data.paymentUrl);
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

  return (
    <Card className="p-6 mb-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">{t("complete_payment")}</h3>
            <p className="text-gray-500 text-sm">{t("amount")}: {amount} XAF</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <img 
              src="/images/cinetpay-logo.png" 
              alt="Cinetpay" 
              className="h-8" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://cinetpay.com/assets/images/marketcine.png";
              }}
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-col space-y-2">
          <p className="text-sm">
            <span className="font-medium">{t("selected_payment_method")}: </span>
            {selectedPaymentMethod === "mtn_mobile_money" && "MTN Mobile Money"}
            {selectedPaymentMethod === "orange_money" && "Orange Money"}
            {selectedPaymentMethod === "credit_card" && "Credit/Debit Card"}
          </p>
          
          <Button
            onClick={initiatePayment}
            disabled={loading}
            className="w-full"
          >
            {loading ? t("processing") : t("proceed_to_payment")}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            {t("secure_payment_message")}
          </p>
        </div>
      </div>
    </Card>
  );
};
