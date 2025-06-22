import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/utils/apiClient";

export const usePayments = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  // Fetch vendor payment info
  const fetchPaymentInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.get('/payments/vendor/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPaymentInfo(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch payment information');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Update vendor payment settings
  const updatePaymentSettings = async (paymentSettings) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.put('/payments/vendor/settings', paymentSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to update payment settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register vendor with Cinetpay
  const registerWithCinetpay = async (vendorData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.post('/payments/vendor/register', vendorData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to register with Cinetpay');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Initiate a payment
  const initiatePayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.post('/payments/initialize', paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify a payment
  const verifyPayment = async (reference) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await ApiClient.get(`/payments/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (err) {
      setError(err.message || 'Failed to verify payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    paymentInfo,
    fetchPaymentInfo,
    updatePaymentSettings,
    registerWithCinetpay,
    initiatePayment,
    verifyPayment
  };
};
