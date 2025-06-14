const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

class PaymentService {
  constructor() {
    this.apiUrl = process.env.CINETPAY_API_URL || 'https://api-checkout.cinetpay.com/v2/payment';
    this.siteId = process.env.CINETPAY_SITE_ID;
    this.apiKey = process.env.CINETPAY_API_KEY;
    this.notifyUrl = process.env.API_BASE_URL + '/api/v1/payments/webhook';
    this.returnUrl = process.env.FRONTEND_URL + '/payment/confirmation';
  }

  /**
   * Calculate markup percentage based on transaction amount
   * @param {number} amount - Transaction amount in XAF
   * @returns {number} - Markup percentage
   */
  calculateMarkupPercentage(amount) {
    if (amount <= 50000) {
      return 15;
    } else if (amount <= 100000) {
      return 20;
    } else if (amount <= 300000) {
      return 25;
    } else if (amount <= 1000000) {
      return 30;
    } else {
      return 35;
    }
  }

  /**
   * Calculate vendor commission based on amount and markup
   * @param {number} amount - Transaction amount in XAF
   * @returns {Object} - Commission details
   */
  calculateCommission(amount) {
    const markupPercentage = this.calculateMarkupPercentage(amount);
    const commission = (amount * markupPercentage) / 100;
    const vendorAmount = amount - commission;
    
    return {
      markupPercentage,
      commission,
      vendorAmount,
      platformFee: commission
    };
  }

  /**
   * Initialize a payment transaction with Cinetpay
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Transaction details
   */
  async initiateTransaction(paymentData) {
    try {
      const { amount, customer, description, metadata, vendorId } = paymentData;
      
      // Calculate commission
      const { markupPercentage, commission, vendorAmount } = this.calculateCommission(amount);
      
      // Create transaction reference
      const transaction_id = `TXN-${uuidv4().substring(0, 8)}`;
      
      // Store transaction in database first
      const transactionData = {
        id: uuidv4(),
        reference: transaction_id,
        amount,
        vendor_id: vendorId,
        customer_id: customer.id,
        commission,
        vendor_amount: vendorAmount,
        status: 'pending',
        metadata: {
          ...metadata,
          markupPercentage,
          description
        },
        created_at: new Date().toISOString()
      };
      
      await this.storeTransaction(transactionData);
      
      // Prepare payload for Cinetpay
      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id,
        amount,
        currency: 'XAF',
        description,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone_number: customer.phone,
        customer_address: customer.address || '',
        customer_city: customer.city || '',
        customer_country: customer.country || 'CM',
        customer_state: customer.state || '',
        customer_zip_code: customer.zipCode || '',
        notify_url: this.notifyUrl,
        return_url: this.returnUrl,
        channels: 'ALL',
        metadata: JSON.stringify({
          vendor_id: vendorId,
          commission,
          vendor_amount: vendorAmount,
          customer_id: customer.id,
          transaction_id
        }),
        // Payment split configuration
        alternative_currency: '',
        split_payment: [
          {
            split_merchant: process.env.CINETPAY_PLATFORM_MERCHANT_ID,
            split_amount: commission
          },
          {
            split_merchant: await this.getVendorCinetpayId(vendorId),
            split_amount: vendorAmount
          }
        ]
      };
      
      // Make API call to Cinetpay
      const response = await axios.post(this.apiUrl, payload);
      
      if (response.data.code !== '201') {
        throw new Error(`Cinetpay payment initiation failed: ${response.data.message}`);
      }
      
      // Update transaction with payment link
      await supabase
        .from('transactions')
        .update({ 
          payment_link: response.data.data.payment_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionData.id);
      
      return {
        ...response.data,
        transactionId: transaction_id,
        paymentUrl: response.data.data.payment_url
      };
    } catch (error) {
      console.error('Payment service - Initiate transaction error:', error);
      throw error;
    }
  }

  /**
   * Get vendor's Cinetpay Merchant ID
   * @param {string} vendorId - Vendor ID
   * @returns {Promise<string>} - Cinetpay Merchant ID
   */
  async getVendorCinetpayId(vendorId) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('cinetpay_merchant_id')
        .eq('id', vendorId)
        .single();
        
      if (error) throw error;
      
      // If vendor doesn't have a Cinetpay merchant ID, use the platform's ID (funds will be transferred later)
      return data.cinetpay_merchant_id || process.env.CINETPAY_PLATFORM_MERCHANT_ID;
    } catch (error) {
      console.error('Error getting vendor Cinetpay ID:', error);
      // Default to platform merchant ID if there's an error
      return process.env.CINETPAY_PLATFORM_MERCHANT_ID;
    }
  }

  /**
   * Store transaction in database
   * @param {Object} transaction - Transaction data
   * @returns {Promise<Object>} - Stored transaction
   */
  async storeTransaction(transaction) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment service - Store transaction error:', error);
      throw error;
    }
  }

  /**
   * Verify payment transaction status
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} - Transaction details
   */
  async verifyTransaction(reference) {
    try {
      // Check transaction status with Cinetpay
      const payload = {
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: reference
      };
      
      const response = await axios.post(
        'https://api-checkout.cinetpay.com/v2/payment/check',
        payload
      );
      
      // Map Cinetpay status to our status
      let transactionStatus = 'pending';
      if (response.data.data.status === 'ACCEPTED') {
        transactionStatus = 'successful';
      } else if (response.data.data.status === 'REFUSED') {
        transactionStatus = 'failed';
      } else if (response.data.data.status === 'CANCELLED') {
        transactionStatus = 'cancelled';
      }
      
      // Update transaction status in database
      await this.updateTransactionStatus(reference, transactionStatus);
      
      // If transaction is successful, process vendor payment
      if (transactionStatus === 'successful') {
        await this.processVendorPayment(reference);
      }
      
      return {
        ...response.data,
        status: transactionStatus
      };
    } catch (error) {
      console.error('Payment service - Verify transaction error:', error);
      throw error;
    }
  }

  /**
   * Update transaction status in database
   * @param {string} reference - Transaction reference
   * @param {string} status - Transaction status
   * @returns {Promise<Object>} - Updated transaction
   */
  async updateTransactionStatus(reference, status) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('reference', reference)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment service - Update transaction status error:', error);
      throw error;
    }
  }

  /**
   * Process vendor payment
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} - Processed payment
   */
  async processVendorPayment(reference) {
    try {
      // Get transaction details
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*, vendor:vendors(*)')
        .eq('reference', reference)
        .single();

      if (error) throw error;
      
      // Skip if transaction is not successful
      if (transaction.status !== 'successful') {
        return;
      }
      
      // Create vendor earnings record
      const { data: earnings, error: earningsError } = await supabase
        .from('vendor_earnings')
        .insert([{
          id: uuidv4(),
          vendor_id: transaction.vendor_id,
          transaction_id: transaction.id,
          amount: transaction.vendor_amount,
          commission: transaction.commission,
          order_id: transaction.metadata.order_id || null,
          created_at: new Date().toISOString(),
          status: 'completed'
        }])
        .select()
        .single();

      if (earningsError) throw earningsError;
      
      // Create vendor payout record if not using split payment directly
      if (!transaction.vendor.cinetpay_merchant_id) {
        const { data: payout, error: payoutError } = await supabase
          .from('vendor_payouts')
          .insert([{
            id: uuidv4(),
            vendor_id: transaction.vendor_id,
            amount: transaction.vendor_amount,
            transaction_reference: transaction.reference,
            status: 'pending',
            scheduled_date: this.calculateNextPayoutDate(transaction.vendor.payout_frequency),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (payoutError) throw payoutError;
        return payout;
      }
      
      // If using split payment, no need to create a payout record
      return earnings;
    } catch (error) {
      console.error('Payment service - Process vendor payment error:', error);
      throw error;
    }
  }

  /**
   * Calculate next payout date based on frequency
   * @param {string} frequency - Payout frequency (weekly, biweekly, monthly)
   * @returns {string} - Next payout date
   */
  calculateNextPayoutDate(frequency) {
    const today = new Date();
    let nextPayoutDate;
    
    switch (frequency) {
      case 'weekly':
        // Next Monday
        nextPayoutDate = new Date(today);
        nextPayoutDate.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
        break;
      case 'biweekly':
        // Next 1st or 15th
        nextPayoutDate = new Date(today);
        if (today.getDate() < 15) {
          nextPayoutDate.setDate(15);
        } else {
          nextPayoutDate.setMonth(today.getMonth() + 1, 1);
        }
        break;
      case 'monthly':
      default:
        // Next 1st
        nextPayoutDate = new Date(today);
        nextPayoutDate.setMonth(today.getMonth() + 1, 1);
        break;
    }
    
    return nextPayoutDate.toISOString().split('T')[0];
  }

  /**
   * Register a vendor with Cinetpay
   * @param {Object} vendorData - Vendor data
   * @returns {Promise<Object>} - Registered vendor details
   */
  async registerVendorWithCinetpay(vendorData) {
    try {
      // Note: Cinetpay vendor registration usually requires contacting Cinetpay support
      // This is a placeholder for that process - in reality, this would be a manual process
      // or through a Cinetpay partner dashboard
      
      // For now, we'll simulate the process by updating the vendor record with a fake merchant ID
      // In a production environment, you would actually integrate with Cinetpay's merchant API
      const merchantId = `CMP-${uuidv4().substring(0, 8)}`;
      
      // Update vendor record with Cinetpay merchant ID
      await supabase
        .from('vendors')
        .update({
          cinetpay_merchant_id: merchantId,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorData.id);
      
      return { 
        success: true, 
        merchant_id: merchantId,
        message: 'Vendor registered with Cinetpay' 
      };
    } catch (error) {
      console.error('Payment service - Register vendor with Cinetpay error:', error);
      throw error;
    }
  }

  /**
   * Get vendor payout history
   * @param {string} vendorId - Vendor ID
   * @returns {Promise<Array>} - Payout history
   */
  async getVendorPayoutHistory(vendorId) {
    try {
      const { data, error } = await supabase
        .from('vendor_payouts')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment service - Get vendor payout history error:', error);
      throw error;
    }
  }

  /**
   * Get vendor earnings history
   * @param {string} vendorId - Vendor ID
   * @returns {Promise<Array>} - Earnings history
   */
  async getVendorEarningsHistory(vendorId) {
    try {
      const { data, error } = await supabase
        .from('vendor_earnings')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment service - Get vendor earnings history error:', error);
      throw error;
    }
  }

  /**
   * Get vendor transaction history
   * @param {string} vendorId - Vendor ID
   * @returns {Promise<Array>} - Transaction history
   */
  async getVendorTransactionHistory(vendorId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Payment service - Get vendor transaction history error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
