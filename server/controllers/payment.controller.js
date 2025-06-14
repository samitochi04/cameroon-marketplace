const { createCinetpayPayment } = require('../services/cinetpayService');
const supabase = require('../supabase/supabaseClient');

exports.initializePayment = async (req, res) => {
  try {
    const { orderId, amount, customer, description, metadata } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID and amount are required' 
      });
    }
    
    // Get order details from database if needed
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Create payment in Cinetpay
    const paymentData = await createCinetpayPayment({
      transaction_id: orderId.toString(),
      amount,
      customer_name: customer?.name || order.shippingAddress?.fullName || 'Customer',
      customer_email: customer?.email || 'customer@example.com',
      customer_phone_number: customer?.phone || order.shippingAddress?.phoneNumber || '',
      payment_method: metadata?.payment_method || 'ALL',
    });
    
    // Update order with payment reference
    await supabase
      .from('orders')
      .update({ 
        payment_reference: paymentData.payment_token,
        payment_status: 'pending' 
      })
      .eq('id', orderId);
    
    return res.status(200).json({
      success: true,
      data: {
        paymentUrl: paymentData.payment_url,
        paymentToken: paymentData.payment_token,
        transactionId: orderId
      }
    });
    
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
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
