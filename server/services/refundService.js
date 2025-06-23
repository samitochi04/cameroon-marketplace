const supabase = require('../supabase/supabaseClient');
const emailService = require('./emailService');

class RefundService {
  // Process refund for delayed orders (orders pending > 3 days)
  async processDelayedOrderRefund(orderId, customerId, refundAmount, delayDays) {
    try {
      console.log(`Processing refund for delayed order ${orderId}: ${refundAmount} XAF`);
      
      // Check if refund already exists
      const { data: existingRefund, error: refundCheckError } = await supabase
        .from('refunds')
        .select('id')
        .eq('order_id', orderId)
        .single();
      
      if (existingRefund) {
        console.log(`Refund already processed for order ${orderId}`);
        return { success: false, message: 'Refund already processed' };
      }
      
      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: orderId,
          customer_id: customerId,
          amount: refundAmount,
          reason: `Automatic refund - Order delayed for ${delayDays} days`,
          status: 'processed',
          refund_method: 'automatic',
          processed_at: new Date().toISOString(),
          notes: `Order was pending for more than 3 days (${delayDays} days). Automatic refund initiated.`
        })
        .select()
        .single();
      
      if (refundError) {
        console.error('Error creating refund record:', refundError);
        throw new Error('Failed to create refund record');
      }
      
      // Update order status to cancelled
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
          notes: `Cancelled due to vendor delay (${delayDays} days). Refund processed.`
        })
        .eq('id', orderId);
      
      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
        // Don't fail the refund if order update fails
      }
      
      // Update all order items to cancelled
      const { error: itemsUpdateError } = await supabase
        .from('order_items')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);
      
      if (itemsUpdateError) {
        console.error('Error updating order items status:', itemsUpdateError);
        // Don't fail the refund if items update fails
      }
      
      // In a real implementation, you would integrate with payment processor here
      // For now, we'll simulate the refund processing
      console.log(`Simulated refund of ${refundAmount} XAF to customer ${customerId}`);
      
      return {
        success: true,
        refund: refund,
        message: 'Refund processed successfully'
      };
      
    } catch (error) {
      console.error('Error processing delayed order refund:', error);
      throw error;
    }
  }
  
  // Check for orders that have been pending for more than 3 days
  async checkAndProcessDelayedOrders() {
    try {
      console.log('Checking for delayed orders...');
      
      // Calculate 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      // Find orders that are still pending after 3 days
      const { data: delayedOrders, error } = await supabase
        .from('orders')
        .select('id, user_id, total_amount, created_at, payment_status')
        .eq('status', 'pending')
        .eq('payment_status', 'completed') // Only refund orders that were paid
        .lt('created_at', threeDaysAgo.toISOString());
      
      if (error) {
        console.error('Error fetching delayed orders:', error);
        return { success: false, message: 'Failed to fetch delayed orders' };
      }
      
      console.log(`Found ${delayedOrders?.length || 0} delayed orders`);
      
      const results = [];
      
      // Process each delayed order
      for (const order of delayedOrders || []) {
        try {
          const orderDate = new Date(order.created_at);
          const now = new Date();
          const delayDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
          
          console.log(`Processing delayed order ${order.id} (${delayDays} days old)`);
          
          // Process refund
          const refundResult = await this.processDelayedOrderRefund(
            order.id,
            order.user_id,
            order.total_amount,
            delayDays
          );
          
          if (refundResult.success) {
            // Send email notification to customer
            await emailService.sendCustomerOrderStatusNotification(
              order.user_id,
              order.id,
              'cancelled',
              {
                order_total: order.total_amount,
                refund_amount: order.total_amount,
                refund_reason: `Order was automatically cancelled because it remained pending for ${delayDays} days`,
                vendor_delay_days: delayDays,
                order_date: new Date(order.created_at).toLocaleDateString('fr-CM')
              }
            );
            
            results.push({
              orderId: order.id,
              success: true,
              refundAmount: order.total_amount,
              delayDays: delayDays
            });
          } else {
            results.push({
              orderId: order.id,
              success: false,
              error: refundResult.message,
              delayDays: delayDays
            });
          }
          
          // Add delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (orderError) {
          console.error(`Error processing order ${order.id}:`, orderError);
          results.push({
            orderId: order.id,
            success: false,
            error: orderError.message
          });
        }
      }
      
      console.log(`Processed ${results.length} delayed orders`);
      return {
        success: true,
        processedCount: results.length,
        results: results
      };
      
    } catch (error) {
      console.error('Error in checkAndProcessDelayedOrders:', error);
      return { success: false, message: error.message };
    }
  }
  
  // Manual refund processing (for admin use)
  async processManualRefund(orderId, amount, reason, adminId) {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, total_amount, status')
        .eq('id', orderId)
        .single();
      
      if (orderError || !order) {
        throw new Error('Order not found');
      }
      
      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: orderId,
          customer_id: order.user_id,
          amount: amount,
          reason: reason,
          status: 'processed',
          refund_method: 'manual',
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          notes: `Manual refund processed by admin: ${reason}`
        })
        .select()
        .single();
      
      if (refundError) {
        throw new Error('Failed to create refund record');
      }
      
      // Update order status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError);
      }
      
      return { success: true, refund: refund };
      
    } catch (error) {
      console.error('Error processing manual refund:', error);
      throw error;
    }
  }
}

module.exports = new RefundService();