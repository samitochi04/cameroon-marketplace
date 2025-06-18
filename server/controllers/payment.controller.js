const axios = require('axios');
require('dotenv').config();
const { createCampayPayment, checkPaymentStatus } = require('../services/campayService');
const supabase = require('../supabase/supabaseClient');

exports.initializePayment = async (req, res) => {
  try {
    const {
      amount,
      customer,
      description,
      metadata,
      vendor_id
    } = req.body;

    // Validate required fields
    if (!amount || !customer || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Amount and customer phone number are required'
      });
    }

    // Generate a shorter, more manageable transaction ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const transaction_id = `${timestamp}${randomSuffix}`.substring(0, 12); // Limit to 12 characters

    console.log('Campay payment payload:', {
      transaction_id,
      amount,
      phone_number: customer.phone,
      description,
      external_reference: transaction_id
    });

    try {
      const paymentResult = await createCampayPayment({
        transaction_id,
        amount,
        phone_number: customer.phone,
        description: description || `Payment for order #${transaction_id}`,
        external_reference: transaction_id
      });

      console.log('Campay payment result:', paymentResult);

      if (paymentResult && paymentResult.reference) {
        // Store payment reference in database if needed
        // You can create a payments table to track this
        
        return res.status(200).json({
          success: true,
          data: {
            reference: paymentResult.reference,
            status: paymentResult.status,
            transactionId: transaction_id,
            ussd_code: paymentResult.ussd_code,
            operator: paymentResult.operator,
            message: 'Payment initiated successfully. Please complete the payment on your mobile device.'
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to initialize payment'
        });
      }
    } catch (error) {
      console.error('Campay error:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize payment'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }
    
    // Check payment status with Campay
    const paymentStatus = await checkPaymentStatus(reference);
    
    if (paymentStatus.status === 'SUCCESSFUL') {
      // Update order status in database
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid', 
          payment_status: 'completed',
          payment_reference: reference
        })
        .eq('payment_reference', reference)
        .select();
      
      if (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Payment verified but failed to update order status' 
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          status: paymentStatus.status,
          reference: reference,
          order: data[0]
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment ${paymentStatus.status.toLowerCase()}`,
        data: {
          status: paymentStatus.status,
          reference: reference
        }
      });
    }
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }
    
    const paymentStatus = await checkPaymentStatus(reference);
    
    return res.status(200).json({
      success: true,
      data: paymentStatus
    });
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};
