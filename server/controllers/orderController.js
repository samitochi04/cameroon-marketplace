const supabase = require(`../supabase/supabaseClient`);
const { createCampayPayment } = require('../services/campayService');

exports.createOrder = async (req, res) => {
    try {
        console.log('Received order data:', req.body);
        
        // Extract required fields
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

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        // Get user profile to check if they are a vendor
        const { data: userProfile, error: userError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
            
        if (userError) {
            console.error('Error fetching user profile:', userError);
            return res.status(500).json({
                success: false,
                message: 'Failed to verify user information'
            });
        }
        
        // Check if vendor is trying to buy their own products
        if (userProfile.role === 'vendor') {
            const ownProducts = items.filter(item => item.vendor_id === userId);
            if (ownProducts.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vendors cannot purchase their own products'
                });
            }
        }
        
        // Validate that all items have vendor_id
        for (const item of items) {
            if (!item.vendor_id) {
                return res.status(400).json({
                    success: false,
                    message: 'All items must have a vendor_id'
                });
            }
        }
        
        // Calculate total if not provided
        const total = totalAmount || subtotal + shipping;
        
        // For development: simulate successful payment
        const paymentStatus = paymentMethod === 'simulated_payment' ? 'completed' : 'pending';
        const orderStatus = paymentMethod === 'simulated_payment' ? 'pending' : 'pending';
        
        // Create the order in database
        const { data: order, error } = await supabase
            .from('orders')
            .insert([{ 
                user_id: userId,
                shipping_address: shippingAddress,
                billing_address: billingAddress || shippingAddress,
                shipping_method: shippingMethod || 'standard',
                payment_method: paymentMethod || 'simulated_payment',
                subtotal: Number(subtotal),
                shipping_fee: Number(shipping),
                total_amount: Number(total),
                status: orderStatus,
                payment_status: paymentStatus,
                payment_intent_id: paymentMethod === 'simulated_payment' ? `sim_${Date.now()}` : null,
                notes: paymentMethod === 'simulated_payment' ? 'Development order - simulated payment' : null
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

        console.log('Created order:', order);

        // Insert order items with user_id
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            vendor_id: item.vendor_id,
            user_id: userId, // Add user_id to each order item
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
            
            // Try to rollback the order if items creation failed
            await supabase
                .from('orders')
                .delete()
                .eq('id', order.id);
                
            return res.status(500).json({
                success: false,
                message: 'Failed to save order items',
                error: itemsError.message
            });
        }

        console.log('Created order items:', createdItems);
        
        // Return success with the complete order
        return res.status(200).json({ 
            success: true, 
            message: 'Order created successfully',
            order: {
                ...order,
                items: createdItems
            }
        });
        
    } catch (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'An unexpected error occurred', 
            error: err.message 
        });
    }
};

// Get order by ID with items - ensure user can only see their own orders
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query; // Get userId from query params
        
        // Fetch order with user validation
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId) // Ensure user can only see their own orders
            .single();
            
        if (orderError || !order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or access denied'
            });
        }

        // Fetch order items with product details - fix the relationship ambiguity
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                *,
                products!order_items_product_id_fkey (
                    id,
                    name,
                    images
                )
            `)
            .eq('order_id', id)
            .eq('user_id', userId); // Ensure user can only see their own order items

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
            // Fallback: fetch order items without product details
            const { data: fallbackItems, error: fallbackError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', id)
                .eq('user_id', userId);
                
            if (fallbackError) {
                console.error('Fallback order items fetch failed:', fallbackError);
                return res.status(200).json({
                    success: true,
                    order: {
                        ...order,
                        items: []
                    }
                });
            }
            
            // Process fallback items without product details
            const processedFallbackItems = (fallbackItems || []).map(item => ({
                ...item,
                name: 'Product',
                image: '/product-placeholder.jpg'
            }));
            
            return res.status(200).json({
                success: true,
                order: {
                    ...order,
                    items: processedFallbackItems
                }
            });
        }

        // Process items to include image URLs
        const processedItems = (orderItems || []).map(item => {
            let imageArray = [];
            try {
                if (item.products?.images) {
                    if (typeof item.products.images === 'string') {
                        imageArray = JSON.parse(item.products.images);
                    } else if (Array.isArray(item.products.images)) {
                        imageArray = item.products.images;
                    }
                }
            } catch (e) {
                console.warn("Error parsing product images:", e);
            }
            
            return {
                ...item,
                name: item.products?.name || 'Product',
                image: imageArray.length > 0 ? imageArray[0] : '/product-placeholder.jpg'
            };
        });
        
        return res.status(200).json({
            success: true,
            order: {
                ...order,
                items: processedItems
            }
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

// Get orders by user ID - ensure user can only see their own orders
exports.getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch orders',
                error: error.message
            });
        }
        
        return res.status(200).json({
            success: true,
            orders: orders || []
        });
        
    } catch (err) {
        console.error('Error fetching user orders:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: err.message
        });
    }
};