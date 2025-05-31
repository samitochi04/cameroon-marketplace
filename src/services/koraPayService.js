import { api } from '@/services/api';

// Global reference to Kora SDK instance
let koraSDK = null;
let callbackHandlers = {};

export const koraPayService = {
  /**
   * Initialize Kora Pay SDK
   * 
   * @returns {Promise<void>}
   */
  async initializeKora() {
    try {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Kora SDK can only be initialized in browser environment');
      }
      
      // Check if SDK already exists
      if (koraSDK) return;
      
      // Check if the Kora script is already loaded
      if (!window.KoraPay) {
        // Load Kora SDK script
        await this.loadKoraScript();
      }
      
      // Initialize the SDK with public key
      koraSDK = await window.KoraPay.initialize({
        publicKey: import.meta.env.VITE_KORA_PAY_PUBLIC_KEY,
        environment: import.meta.env.MODE === 'production' ? 'production' : 'sandbox'
      });
      
      return koraSDK;
    } catch (error) {
      console.error('Failed to initialize Kora Pay SDK:', error);
      throw error;
    }
  },
  
  /**
   * Load the Kora Pay SDK script
   * 
   * @returns {Promise<void>}
   */
  loadKoraScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.korapay.com/v1/korapay.js';
      script.async = true;
      
      script.onload = () => {
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Kora Pay SDK'));
      };
      
      document.head.appendChild(script);
    });
  },
  
  /**
   * Create a payment transaction with our backend
   * 
   * @param {Object} data - Payment data
   * @returns {Promise<Object>} - Transaction data
   */
  async createTransaction(data) {
    try {
      const response = await api.post('/payments/create', {
        amount: data.amount,
        orderId: data.orderId,
        customer: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create payment transaction:', error);
      throw error;
    }
  },
  
  /**
   * Register callback handlers for the payment flow
   * 
   * @param {Object} handlers - Callback handlers
   */
  registerCallbacks(handlers) {
    callbackHandlers = handlers;
  },
  
  /**
   * Open the Kora payment modal
   * 
   * @param {string} transactionId - Transaction ID from the backend
   */
  openPaymentModal(transactionId) {
    if (!koraSDK) {
      throw new Error('Kora SDK not initialized');
    }
    
    koraSDK.openPaymentWidget({
      transactionId,
      callback: (response) => {
        if (response.status === 'successful') {
          if (callbackHandlers.onSuccess) {
            callbackHandlers.onSuccess(response);
          }
        } else {
          const error = new Error(response.message || 'Payment failed');
          if (callbackHandlers.onError) {
            callbackHandlers.onError(error);
          }
        }
      },
      onClose: () => {
        if (callbackHandlers.onClose) {
          callbackHandlers.onClose();
        }
      }
    });
  },
  
  /**
   * Verify payment with our backend
   * 
   * @param {string} orderId - Order ID
   * @param {string} transactionId - Kora transaction ID
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPayment(orderId, transactionId) {
    try {
      const response = await api.post('/payments/verify', {
        orderId,
        transactionId
      });
      
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  },
  
  /**
   * Clean up Kora SDK references
   */
  cleanup() {
    koraSDK = null;
    callbackHandlers = {};
  }
};
