const axios = require('axios');
require('dotenv').config();
const supabase = require('../supabase/supabaseClient');

exports.initializePayment = async (req, res) => {
  try {
    const {
      amount,
      currency,
      description,
      customer_id,
      customer_name,
      customer_surname,
      customer_email,
      customer_phone_number,
      customer_address,
      customer_city,
      customer_country,
      customer_state,
      customer_zip_code,
      notify_url,
      return_url,
      channels,
      lang,
      metadata
    } = req.body;

    const payload = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      amount,
      currency,
      description,
      customer_id,
      customer_name,
      customer_surname,
      customer_email,
      customer_phone_number,
      customer_address,
      customer_city,
      customer_country,
      customer_state,
      customer_zip_code,
      notify_url,
      return_url,
      channels,
      lang,
      metadata,
    };
    console.log('Cinetpay payload:', payload);

    try {
      const response = await axios.post(
        'https://api-checkout.cinetpay.com/v2/payment',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Cinetpay response:', response.data);

      if (response.data && response.data.code === '201') {
        return res.status(200).json({
          success: true,
          data: {
            paymentUrl: response.data.data.payment_url,
            paymentToken: response.data.data.payment_token,
            transactionId: payload.transaction_id
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: response.data.message || 'Failed to create payment'
        });
      }
    } catch (error) {
      console.error('Cinetpay error:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize payment'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.body;
    
    if (!transaction_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction ID is required' 
      });
    }
    
    // Update order status to paid
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'paid', payment_status: 'completed' })
      .eq('id', transaction_id)
      .select();
    
    if (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to verify payment' 
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};
