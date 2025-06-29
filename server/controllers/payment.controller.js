const axios = require('axios');
require('dotenv').config();
const { createCampayPayment, checkPaymentStatus } = require('../services/campayService');
const emailService = require('../services/emailService');
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

    console.log('Payment initialization request:', {
      amount,
      customerPhone: customer.phone,
      description,
      metadata
    });

    // Generate a shorter, more manageable transaction ID
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const transaction_id = `${timestamp}${randomSuffix}`.substring(0, 12); // Limit to 12 characters

    console.log('Campay payment payload:', {
      transaction_id,
      amount: parseInt(amount), // Ensure it's an integer
      phone_number: customer.phone,
      description,
      external_reference: transaction_id
    });

    try {
      const paymentResult = await createCampayPayment({
        transaction_id,
        amount: parseInt(amount), // Ensure integer
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
    const { reference, orderData } = req.body;
    
    console.log('Payment verification requested for reference:', reference);
    console.log('Order data provided:', !!orderData);
    console.log('User ID from request:', req.user?.id);
    
    if (!reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment reference is required' 
      });
    }
    
    // Check payment status with Campay
    const paymentStatus = await checkPaymentStatus(reference);
    console.log('Payment status from Campay:', paymentStatus);
    
    if (paymentStatus.status === 'SUCCESSFUL') {
      // If orderData is provided, create the order now (after successful payment)
      if (orderData) {
        try {
          // Create the order with successful payment
          const { 
            userId,
            items, 
            shippingAddress, 
            billingAddress, 
            shippingMethod,
            paymentMethod,
            subtotal = 0,
            shipping = 0,
            totalAmount
          } = orderData;
          
          const total = totalAmount || subtotal + shipping;
          
          // Create the order in database with payment completed
          const { data: order, error } = await supabase
            .from('orders')
            .insert([{ 
              user_id: userId,
              shipping_address: shippingAddress,
              billing_address: billingAddress || shippingAddress,
              shipping_method: shippingMethod || 'standard',
              payment_method: paymentMethod || 'campay',
              subtotal: Number(subtotal),
              shipping_fee: Number(shipping),
              total_amount: Number(total),
              status: 'paid',
              payment_status: 'completed',
              payment_intent_id: reference
            }])
            .select()
            .single();

          if (error) {
            console.error('Order save error after payment:', error);
            return res.status(500).json({ 
              success: false, 
              message: 'Payment successful but failed to create order', 
              error: error.message 
            });
          }

          // Insert order items
          const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            vendor_id: item.vendor_id,
            user_id: userId,
            quantity: Number(item.quantity),
            price: Number(item.price),
            total: Number(item.total),
            status: 'pending'
          }));

          const { data: createdItems, error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)
            .select();

          if (itemsError) {
            console.error('Order items save error:', itemsError);
            return res.status(500).json({
              success: false,
              message: 'Payment successful but failed to save order items',
              error: itemsError.message
            });
          }

          // Update product stock
          const stockService = require('../services/stockService');
          try {
            for (const item of createdItems) {
              await stockService.updateProductStock(item.product_id, item.quantity);
            }
          } catch (stockError) {
            console.error('Failed to update product stock:', stockError);
          }
          
          // Send email notifications to vendors
          try {
            const vendorGroups = {};
            createdItems.forEach(item => {
              if (!vendorGroups[item.vendor_id]) {
                vendorGroups[item.vendor_id] = [];
              }
              vendorGroups[item.vendor_id].push(item);
            });
            
            for (const vendorId of Object.keys(vendorGroups)) {
              const vendorItems = vendorGroups[vendorId];
              const vendorTotal = vendorItems.reduce((sum, item) => sum + item.total, 0);
              
              await emailService.sendNewOrderNotification(vendorId, order.id, {
                customer_name: shippingAddress.fullName || 'Customer',
                total_amount: vendorTotal,
                items_count: vendorItems.length
              });
            }
          } catch (emailError) {
            console.error('Failed to send vendor email notifications:', emailError);
          }

          // Send order confirmation email to customer
          try {
            await emailService.sendOrderConfirmationEmail(userId, order.id, {
              totalAmount: order.total_amount,
              paymentMethod: order.payment_method
            });
            console.log(`Order confirmation email sent for order ${order.id}`);
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
          
          return res.status(200).json({
            success: true,
            message: 'Payment verified and order created successfully',
            data: {
              status: paymentStatus.status,
              reference: reference,
              order: {
                ...order,
                items: createdItems
              }
            }
          });
          
        } catch (orderError) {
          console.error('Error creating order after payment:', orderError);
          return res.status(500).json({
            success: false,
            message: 'Payment successful but failed to create order',
            error: orderError.message
          });
        }
      } else {
        // Legacy behavior - just update existing order
        const { data, error } = await supabase
          .from('orders')
          .update({ 
            status: 'paid', 
            payment_status: 'completed',
            payment_intent_id: reference
          })
          .eq('payment_intent_id', reference)
          .select();
        
        if (error) {
          console.error('Error updating order status:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Payment verified but failed to update order status' 
          });
        }

        // Send order confirmation email to customer if order update was successful
        if (data && data[0]) {
          const order = data[0];
          try {
            await emailService.sendOrderConfirmationEmail(order.user_id, order.id, {
              totalAmount: order.total_amount,
              paymentMethod: order.payment_method
            });
            console.log(`Order confirmation email sent for order ${order.id}`);
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
          }
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
      }
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
    
    console.log('Payment status check requested for reference:', reference);
    console.log('User from request:', req.user?.id);
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }
    
    const paymentStatus = await checkPaymentStatus(reference);
    console.log('Payment status result:', paymentStatus);
    
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
