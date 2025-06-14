const supabase = require(`../supabase/supabaseClient`);
const { createCinetpayPayment } = require('../services/cinetpayService');

exports.createOrder = async (req, res) => {
    try {
        console.log('Received order data:', req.body);
        
        // Extract required fields and provide defaults for missing ones
        const { 
            userId, 
            items, 
            shippingAddress, 
            billingAddress, 
            shippingMethod,
            paymentMethod,
            subtotal = 0,
            shipping = 0,
            totalAmount,
            promoCode
        } = req.body;
        
        // Basic validation
        if (!items || !items.length) {
            return res.status(400).json({ 
                success: false,
                message: 'Order must contain at least one item' 
            });
        }
        
        if (!shippingAddress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address is required' 
            });
        }
        
        // Calculate total if not provided
        const total = totalAmount || subtotal + shipping;
        
        // Create the order in database
        const { data: order, error } = await supabase
            .from('orders')
            .insert([{ 
                user_id: userId,
                shipping_address: shippingAddress,
                billing_address: billingAddress || shippingAddress,
                shipping_method: shippingMethod || 'standard',
                payment_method: paymentMethod || 'mtn_mobile_money',
                subtotal,
                shipping_fee: shipping,
                total_amount: total,
                status: 'pending',
                payment_status: 'pending'
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Order save error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to create order', 
                error: error.message 
            });
        }

        // 2️⃣ Insert each order item with the new order ID
        const orderItems = items.map(item => {
            if (!item.vendor_id) {
                throw new Error('Each order item must have a vendor_id');
            }
            return {
                order_id: order.id,
                product_id: item.productId || item.id,
                vendor_id: item.vendor_id, 
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price,
                status: 'pending'
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items save error:', itemsError);
            return res.status(500).json({
                success: false,
                message: 'Failed to save order items. Each item must have a vendor_id.',
                error: itemsError.message
            });
        }
        
        // Return success without waiting for payment URL
        res.status(200).json({ 
            success: true, 
            message: 'Order created successfully',
            order
        });
        
        // Optionally initiate payment asynchronously
        try {
            if (paymentMethod && paymentMethod !== 'cod') {
                const paymentData = await createCinetpayPayment({
                    transaction_id: order.id.toString(),
                    amount: total,
                    customer_name: shippingAddress.fullName || 'Customer',
                    customer_email: 'customer@example.com', // This should come from user data
                    customer_phone_number: shippingAddress.phoneNumber || ''
                });
                
                // Update order with payment reference if payment was initiated
                if (paymentData && paymentData.payment_token) {
                    await supabase
                        .from('orders')
                        .update({ payment_reference: paymentData.payment_token })
                        .eq('id', order.id);
                }
            }
        } catch (paymentError) {
            console.error('Payment initiation error:', paymentError);
            // We don't send an error response here since the order was already created
            // and we've already sent the success response
        }
        
    } catch (err) {
        console.error('Order creation error:', err);
        // Only send error response if we haven't already sent a response
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                message: 'An unexpected error occurred', 
                error: err.message 
            });
        }
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            order
        });
        
    } catch (err) {
        console.error('Error fetching order:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: err.message
        });
    }
};