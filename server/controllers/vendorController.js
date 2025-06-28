const supabase = require('../supabase/supabaseClient');
const vendorPayoutService = require('../services/vendorPayoutService');
const emailService = require('../services/emailService');

class VendorController {
  /**
   * Update order item status and trigger payout if needed
   * 
   * Business Model:
   * - Customer pays the sale_price (which includes platform commission)
   * - When vendor updates status to "processing", they receive the original price
   * - Platform keeps the difference (commission) between sale_price and price
   */
  async updateOrderItemStatus(req, res) {
    try {
      const { itemId } = req.params;
      const { status } = req.body;
      const vendorId = req.user.id; // From auth middleware
      
      console.log(`Updating order item status: Item ID=${itemId}, New Status=${status}, Vendor ID=${vendorId}`);
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        console.log(`Invalid status: ${status}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      // Get order item details with product info
      console.log(`Querying order_items table with ID: ${itemId}`);
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!order_items_product_id_fkey(vendor_id, name, price, sale_price),
          orders!order_items_order_id_fkey(id, user_id)
        `)
        .eq('id', itemId)
        .single();
      
      if (itemError) {
        console.error(`Error fetching order item: ${itemError.message}`, itemError);
        return res.status(404).json({
          success: false,
          message: `Order item not found: ${itemError.message}`
        });
      }
      
      if (!orderItem) {
        console.log(`Order item not found with ID: ${itemId}`);
        return res.status(404).json({
          success: false,
          message: 'Order item not found'
        });
      }
      
      // Log full structure to debug
      console.log('Complete order item data:', JSON.stringify(orderItem, null, 2));
      
      console.log('Order item found:', {
        id: orderItem.id,
        product_id: orderItem.product_id,
        products: Array.isArray(orderItem.products) ? orderItem.products.length : 'Not an array',
        orders: Array.isArray(orderItem.orders) ? orderItem.orders.length : 'Not an array',
        current_status: orderItem.status
      });
      
      // Normalize products data - it could be an object or an array
      // Supabase sometimes returns a single result as an object instead of an array with one item
      let productData;
      if (Array.isArray(orderItem.products)) {
        if (orderItem.products.length === 0) {
          console.error(`Empty products array for order item ${itemId}`);
          return res.status(404).json({
            success: false,
            message: 'Product associated with this order item not found'
          });
        }
        productData = orderItem.products[0];
      } else if (orderItem.products && typeof orderItem.products === 'object') {
        // If it's a direct object with product properties
        productData = orderItem.products;
      } else {
        console.error(`Product not found for order item ${itemId}`);
        return res.status(404).json({
          success: false,
          message: 'Product associated with this order item not found'
        });
      }
      
      // Normalize orders data - it could be an object or an array
      let ordersData;
      if (Array.isArray(orderItem.orders)) {
        if (orderItem.orders.length === 0) {
          console.error('Empty orders array for processing');
          return res.status(404).json({
            success: false,
            message: 'Order data not found'
          });
        }
        ordersData = orderItem.orders[0];
      } else if (orderItem.orders && typeof orderItem.orders === 'object') {
        // If it's a direct object with order properties
        ordersData = orderItem.orders;
      } else {
        console.error('Missing order data for processing');
        return res.status(404).json({
          success: false,
          message: 'Order data not found'
        });
      }
      
      // Verify product data has vendor ID
      if (!productData || !productData.vendor_id) {
        console.error(`Missing vendor information for product in order item ${itemId}`);
        return res.status(404).json({
          success: false,
          message: 'Product information incomplete'
        });
      }
      
      const productVendorId = productData.vendor_id;
      console.log(`Comparing vendor IDs: Item vendor=${productVendorId}, Current user=${vendorId}`);
      
      if (productVendorId !== vendorId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own products.'
        });
      }
      
      // Update order item status
      console.log(`Updating order item status in database: Item ID=${itemId}, New Status=${status}`);
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
      
      if (updateError) {
        console.error(`Error updating order item status: ${updateError.message}`, updateError);
        return res.status(500).json({
          success: false,
          message: `Failed to update order item status: ${updateError.message}`
        });
      }
      
      console.log(`Successfully updated order item ${itemId} status to ${status}`);
      
      // If status changed to processing, trigger payout
      if (status === 'processing' && orderItem.status !== 'processing') {
        try {
          // First check if we already processed this to avoid duplicate payouts
          console.log(`Checking if payout was already processed for order item ${itemId}...`);
          const { data: payoutCheck } = await supabase
            .from('vendor_payouts')
            .select('id, status')
            .eq('order_item_id', itemId)
            .limit(1);
            
          if (payoutCheck && payoutCheck.length > 0) {
            console.warn(`Payout already processed for order item ${itemId} with status: ${payoutCheck[0].status}. Skipping duplicate.`);
            // Continue with status update but skip payout
          } else {
            console.log(`No existing payout found for order item ${itemId}. Proceeding with payout.`);
            
            // Create a payout record before attempting processing to track the attempt
            const { data: payoutRecord, error: recordError } = await supabase
              .from('vendor_payouts')
              .insert({
                order_id: ordersData.id,
                order_item_id: itemId,
                vendor_id: vendorId,
                status: 'pending',
                created_at: new Date().toISOString()
              })
              .select('id')
              .single();
              
            if (recordError) {
              console.error('Failed to create payout record:', recordError);
              // Continue with payout attempt anyway
            }
            
            // Validate product data has required fields
            if (!productData) {
              console.error('Missing product data for payout calculation');
              throw new Error('Product data not found for payout');
            }
            
            if (typeof productData.price !== 'number') {
              console.error(`Invalid price data type: ${typeof productData.price} for product ID: ${orderItem.product_id}`);
              throw new Error('Product has invalid price data');
            }
            
            if (!ordersData || !ordersData.id) {
              console.error('Missing order ID for payout processing');
              throw new Error('Order information incomplete');
            }
            
            // Always use the original price (vendor price), NOT the sale_price (which includes platform commission)
            const priceToUse = productData.price;
            
            // Safety check to ensure price is valid
            if (priceToUse <= 0) {
              console.error(`Invalid product price: ${priceToUse} for product ID: ${orderItem.product_id}`);
              throw new Error('Product has invalid price (zero or negative)');
            }
            
            // Log price details for accountability and audit trail
            console.log(`Product ID: ${orderItem.product_id}, Vendor Price: ${priceToUse}, Sale Price: ${productData.sale_price || 'N/A'}`);
            
            console.log(`Using vendor price for calculation: ${priceToUse} (sale_price: ${productData.sale_price} is NOT used)`);
            
            // Calculate vendor earnings based on original price
            const vendorEarnings = priceToUse * orderItem.quantity;
            
            // Log the commission details
            if (productData.sale_price && productData.sale_price > priceToUse) {
              const commission = productData.sale_price - priceToUse;
              const commissionPercentage = ((commission / priceToUse) * 100).toFixed(2);
              console.log(`Platform commission: ${commission} XAF per item (${commissionPercentage}%)`);
              console.log(`Total platform commission for this order: ${commission * orderItem.quantity} XAF`);
            }
            console.log(`Processing payout of ${vendorEarnings} XAF to vendor ${vendorId}`);
            
            try {
              // Process payout
              console.log(`Processing payout of ${vendorEarnings} XAF to vendor ${vendorId} for order ${ordersData.id}`);
              const payoutResult = await vendorPayoutService.processVendorPayout(
                ordersData.id,
                vendorId,
                vendorEarnings
              );
              
              // Check if payout was successful or if the payment gateway flagged it as an error
              const isPayoutSuccessful = 
                payoutResult && 
                payoutResult.reference && 
                !payoutResult.error_message &&
                payoutResult.status !== 'FAILED' &&
                payoutResult.status !== 'ERROR';
              
              if (isPayoutSuccessful) {
                console.log(`Payout successful for vendor ${vendorId}: ${vendorEarnings} XAF with reference ${payoutResult.reference}`);
                
                // Update payout record with success status
                if (payoutRecord && payoutRecord.id) {
                  await supabase
                    .from('vendor_payouts')
                    .update({ 
                      status: 'completed',
                      updated_at: new Date().toISOString(),
                      amount: vendorEarnings,
                      reference: payoutResult.reference,
                      operator: payoutResult.operator
                    })
                    .eq('id', payoutRecord.id);
                }
                
                // Send payout notification email with detailed info about earnings and commission
                await emailService.sendPayoutNotification(vendorId, ordersData.id, {
                  amount: vendorEarnings,
                  unit_price: priceToUse,
                  quantity: orderItem.quantity,
                  sale_price_info: productData.sale_price ? {
                    sale_price: productData.sale_price,
                    platform_commission_per_item: productData.sale_price - priceToUse,
                    commission_percentage: ((productData.sale_price - priceToUse) / priceToUse * 100).toFixed(2) + '%'
                  } : null,
                  reference: payoutResult.reference,
                  phone_number: 'Hidden for security',
                  operator: payoutResult.operator
                });
                
                console.log(`Payout processed successfully for vendor ${vendorId}: ${vendorEarnings} XAF`);
              } else {
                // Handle error response from payment gateway
                console.error('Payout response indicates failure:', payoutResult);
                throw new Error(payoutResult.error_message || 'Payment gateway returned an error');
              }
            } catch (processingError) {
              console.error('Payout processing failed:', processingError);
              
              // Update payout record with failed status
              if (payoutRecord && payoutRecord.id) {
                await supabase
                  .from('vendor_payouts')
                  .update({ 
                    status: 'failed',
                    updated_at: new Date().toISOString(),
                    amount: vendorEarnings,
                    error_message: processingError.message || 'Unknown error',
                    retry_count: supabase.sql`retry_count + 1`
                  })
                  .eq('id', payoutRecord.id);
              }
              
              // Continue with status update but track the failure
              // We'll send a notification about the failed payout
              try {
                await emailService.sendPayoutFailureNotification(
                  vendorId, 
                  ordersData.id,
                  {
                    amount: vendorEarnings,
                    error: processingError.message || 'Unknown payment processing error',
                    orderItemId: itemId
                  }
                );
              } catch (notificationError) {
                console.error('Failed to send payout failure notification:', notificationError);
              }
            }
          }
        } catch (payoutError) {
          console.error('Payout processing failed:', payoutError);
          // Don't fail the status update if payout fails
        }
      }
      
      // Send customer notification for status changes to processing or delivered
      if (status === 'processing' || status === 'delivered') {
        try {
          // We already normalized ordersData above
          const orderId = ordersData ? ordersData.id : null;
          const userId = ordersData ? ordersData.user_id : null;
          
          if (!orderId || !userId) {
            console.error('Missing order ID or user ID for customer notification');
            throw new Error('Order information incomplete for notification');
          }
          
          // Get order details for customer notification
          const { data: orderDetails, error: orderDetailsError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('id', orderId)
            .single();
          
          if (!orderDetailsError && orderDetails) {
            await emailService.sendCustomerOrderStatusNotification(
              userId,
              orderId,
              status,
              {
                order_total: orderDetails.total_amount,
                order_date: new Date(orderDetails.created_at).toLocaleDateString('fr-CM')
              }
            );
            
            console.log(`Customer notification sent for order ${orderId} status: ${status}`);
          } else {
            console.error(`Failed to get order details for notification: ${orderDetailsError?.message || 'Unknown error'}`);
          }
        } catch (customerNotificationError) {
          console.error('Failed to send customer notification:', customerNotificationError);
          // Don't fail the status update if customer notification fails
        }
      }
      
      // Check if all items in the order have the same status to update overall order status
      // Inlined the updateOverallOrderStatus logic to avoid this context issues
      if (ordersData && ordersData.id) {
        try {
          console.log(`Checking if all items in order ${ordersData.id} have the same status for overall update`);
          // Get all order items for this order
          const { data: allOrderItems, error: fetchError } = await supabase
            .from('order_items')
            .select('status')
            .eq('order_id', ordersData.id);
          
          if (fetchError || !allOrderItems) {
            console.error('Error fetching order items for status update:', fetchError);
          } else {
            // Check if all items have the same status
            const statuses = allOrderItems.map(item => item.status);
            const uniqueStatuses = [...new Set(statuses)];
            
            if (uniqueStatuses.length === 1) {
              const orderStatus = uniqueStatuses[0];
              console.log(`All ${allOrderItems.length} items in order ${ordersData.id} have status: ${orderStatus}. Updating order status.`);
              
              const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({ 
                  status: orderStatus,
                  updated_at: new Date().toISOString()
                })
                .eq('id', ordersData.id);
              
              if (orderUpdateError) {
                console.error('Failed to update order status:', orderUpdateError);
              } else {
                console.log(`Order ${ordersData.id} status updated to: ${orderStatus}`);
              }
            } else {
              console.log(`Order ${ordersData.id} has items with mixed statuses: ${uniqueStatuses.join(', ')}. Not updating overall status.`);
            }
          }
        } catch (error) {
          console.error('Error updating overall order status:', error);
          // Don't fail the main operation if this fails
        }
      }
      
      // Check if we have any payout information to include in the response
      let payoutStatus = null;
      if (status === 'processing') {
        // Get the latest payout record for this order item
        const { data: latestPayout } = await supabase
          .from('vendor_payouts')
          .select('status, error_message')
          .eq('order_item_id', itemId)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (latestPayout && latestPayout.length > 0) {
          payoutStatus = {
            status: latestPayout[0].status,
            error: latestPayout[0].error_message
          };
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Order item status updated successfully',
        data: {
          itemId: itemId,
          newStatus: status,
          payout: payoutStatus
        }
      });
      
    } catch (error) {
      console.error('Error updating order item status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // Update overall order status based on all items
  async updateOverallOrderStatus(orderId) {
    try {
      // Get all order items for this order
      const { data: allOrderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('status')
        .eq('order_id', orderId);
      
      if (fetchError || !allOrderItems) {
        console.error('Error fetching order items for status update:', fetchError);
        return;
      }
      
      // Check if all items have the same status
      const statuses = allOrderItems.map(item => item.status);
      const uniqueStatuses = [...new Set(statuses)];
      
      if (uniqueStatuses.length === 1) {
        const orderStatus = uniqueStatuses[0];
        
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: orderStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
        
        if (orderUpdateError) {
          console.error('Failed to update order status:', orderUpdateError);
        } else {
          console.log(`Order ${orderId} status updated to: ${orderStatus}`);
        }
      }
    } catch (error) {
      console.error('Error updating overall order status:', error);
    }
  }
  
  // Get vendor earnings summary
  async getVendorEarnings(req, res) {
    try {
      const vendorId = req.user.id;
      
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('balance, total_earnings, last_payout_date, last_payout_amount')
        .eq('id', vendorId)
        .single();
      
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch earnings data'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: vendor
      });
      
    } catch (error) {
      console.error('Error fetching vendor earnings:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new VendorController();
