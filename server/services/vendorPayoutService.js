const axios = require('axios');
const supabase = require('../supabase/supabaseClient');
require('dotenv').config();

const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://demo.campay.net';

class VendorPayoutService {
  // Process payout to vendor when order status changes to processing
  async processVendorPayout(orderId, vendorId, amount, paymentMethod = 'mtn') {
    try {
      console.log(`Processing payout for vendor ${vendorId}, amount: ${amount}`);
      
      // Get vendor payment details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('mobile_money_accounts, has_payment_setup')
        .eq('id', vendorId)
        .single();
      
      if (vendorError || !vendor) {
        throw new Error('Vendor not found');
      }
      
      if (!vendor.has_payment_setup || !vendor.mobile_money_accounts) {
        throw new Error('Vendor payment method not configured');
      }
      
      const mobileAccounts = vendor.mobile_money_accounts;
      let phoneNumber = null;
      let accountName = null;
      let operator = 'MTN'; // Default to MTN
      
      // Determine which payment method to use
      if (paymentMethod === 'mtn' && mobileAccounts.mtn) {
        phoneNumber = mobileAccounts.mtn.phone;
        accountName = mobileAccounts.mtn.accountName;
        operator = 'MTN';
      } else if (paymentMethod === 'orange' && mobileAccounts.orange) {
        phoneNumber = mobileAccounts.orange.phone;
        accountName = mobileAccounts.orange.accountName;
        operator = 'ORANGE';
      } else if (mobileAccounts.mtn) {
        // Fallback to MTN if available
        phoneNumber = mobileAccounts.mtn.phone;
        accountName = mobileAccounts.mtn.accountName;
        operator = 'MTN';
      } else if (mobileAccounts.orange) {
        // Fallback to Orange if MTN not available
        phoneNumber = mobileAccounts.orange.phone;
        accountName = mobileAccounts.orange.accountName;
        operator = 'ORANGE';
      }
      
      if (!phoneNumber) {
        throw new Error('No valid payment method found for vendor');
      }
      
      // Format phone number for Campay
      let formattedPhone = phoneNumber;
      if (typeof phoneNumber === 'string') {
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+237')) {
          formattedPhone = cleaned.substring(1);
        } else if (!cleaned.startsWith('237')) {
          formattedPhone = `237${cleaned}`;
        } else {
          formattedPhone = cleaned;
        }
      }
      
      // Create payout transaction
      const payoutReference = `payout_${orderId}_${vendorId}_${Date.now()}`;
      
      // For development/demo, use smaller amounts
      let adjustedAmount = Number(amount);
      if (CAMPAY_BASE_URL.includes('demo') && adjustedAmount > 100) {
        console.log(`Demo mode: Adjusting payout amount from ${adjustedAmount} to 100 XAF`);
        adjustedAmount = 100;
      }
      
      const payoutResult = await this.sendCampayPayout({
        amount: adjustedAmount,
        to: formattedPhone,
        description: `Vendor payout for order #${orderId}`,
        external_reference: payoutReference
      });
        // Record the payout in database using your existing table structure
      const { error: payoutError } = await supabase
        .from('vendor_payouts')
        .insert({
          vendor_id: vendorId,
          amount: adjustedAmount,
          status: payoutResult.status || 'pending',
          payout_method: operator,
          transaction_id: payoutResult.reference || payoutReference,
          order_reference: orderId.toString(), // Store order ID in order_reference
          phone_number: formattedPhone,
          operator: operator,
          notes: `Payout for order #${orderId} - ${operator} Mobile Money`
        });
      
      if (payoutError) {
        console.error('Error recording payout:', payoutError);
      }
      
      // Update vendor balance and earnings
      await this.updateVendorEarnings(vendorId, adjustedAmount);
      
      return {
        success: true,
        reference: payoutResult.reference || payoutReference,
        amount: adjustedAmount,
        operator: operator
      };
      
    } catch (error) {
      console.error('Payout error:', error);
      throw error;
    }
  }
  
  // Send payout via Campay API
  async sendCampayPayout(payoutData) {
    try {
      const token = process.env.CAMPAY_TOKEN;
      
      if (!token) {
        console.warn('Missing Campay token. Using mock payout for development.');
        return {
          reference: `mock_payout_${Date.now()}`,
          status: 'SUCCESSFUL'
        };
      }
      
      const response = await axios.post(
        `${CAMPAY_BASE_URL}/api/disburse/`,
        payoutData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Campay payout response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Campay payout error:', error.response?.data || error.message);
      
      // Fallback for development
      if (process.env.NODE_ENV !== 'production') {
        return {
          reference: `mock_payout_${Date.now()}`,
          status: 'SUCCESSFUL'
        };
      }
      
      throw error;
    }
  }
  
  // Update vendor earnings and balance
  async updateVendorEarnings(vendorId, amount) {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          total_earnings: supabase.sql`total_earnings + ${amount}`,
          balance: supabase.sql`balance + ${amount}`,
          last_payout_date: new Date().toISOString(),
          last_payout_amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);
      
      if (error) {
        console.error('Error updating vendor earnings:', error);
        throw error;
      }
      
      console.log(`Updated vendor ${vendorId} earnings by ${amount} XAF`);
    } catch (error) {
      console.error('Error updating vendor earnings:', error);
      throw error;
    }
  }
}

module.exports = new VendorPayoutService();