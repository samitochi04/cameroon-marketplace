const supabase = require('../supabase/supabaseClient');
const vendorPayoutService = require('../services/vendorPayoutService');
const emailService = require('../services/emailService');

class VendorController {
  // Update order item status and trigger payout if needed
  async updateOrderItemStatus(req, res) {
    try {
      const { itemId } = req.params;
      const { status } = req.body;
      const vendorId = req.user.id; // From auth middleware
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }
      
      // Get order item details with product info
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select(`
          *,
          products!inner(vendor_id, name, base_price),
          orders!inner(id, user_id)
        `)
        .eq('id', itemId)
        .single();
      
      if (itemError || !orderItem) {
        return res.status(404).json({
          success: false,
          message: 'Order item not found'
        });
      }
      
      // Verify vendor owns this product
      if (orderItem.products.vendor_id !== vendorId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own products.'
        });
      }
      
      // Update order item status
      const { error: updateError } = await supabase
        .from('order_items')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
      
      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update order item status'
        });
      }
        // If status changed to processing, trigger payout
      if (status === 'processing' && orderItem.status !== 'processing') {
        try {
          // Calculate vendor earnings (use base_price instead of sale price to exclude commission)
          const vendorEarnings = orderItem.products.base_price * orderItem.quantity;
          
          // Process payout
          const payoutResult = await vendorPayoutService.processVendorPayout(
            orderItem.orders.id,
            vendorId,
            vendorEarnings
          );
          
          // Send payout notification email
          await emailService.sendPayoutNotification(vendorId, orderItem.orders.id, {
            amount: vendorEarnings,
            reference: payoutResult.reference,
            phone_number: 'Hidden for security',
            operator: payoutResult.operator
          });
          
          console.log(`Payout processed for vendor ${vendorId}: ${vendorEarnings} XAF`);
        } catch (payoutError) {
          console.error('Payout processing failed:', payoutError);
          // Don't fail the status update if payout fails
        }
      }
      
      // Send customer notification for status changes to processing or delivered
      if (status === 'processing' || status === 'delivered') {
        try {
          // Get order details for customer notification
          const { data: orderDetails, error: orderDetailsError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .eq('id', orderItem.orders.id)
            .single();
          
          if (!orderDetailsError && orderDetails) {
            await emailService.sendCustomerOrderStatusNotification(
              orderItem.orders.user_id,
              orderItem.orders.id,
              status,
              {
                order_total: orderDetails.total_amount,
                order_date: new Date(orderDetails.created_at).toLocaleDateString('fr-CM')
              }
            );
            
            console.log(`Customer notification sent for order ${orderItem.orders.id} status: ${status}`);
          }
        } catch (customerNotificationError) {
          console.error('Failed to send customer notification:', customerNotificationError);
          // Don't fail the status update if customer notification fails
        }
      }
      
      // Check if all items in the order have the same status to update overall order status
      await this.updateOverallOrderStatus(orderItem.orders.id);
      
      return res.status(200).json({
        success: true,
        message: 'Order item status updated successfully',
        data: {
          itemId: itemId,
          newStatus: status
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