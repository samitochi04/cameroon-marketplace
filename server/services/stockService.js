const supabase = require('../supabase/supabaseClient');
const emailService = require('./emailService');

class StockService {
  // Update product stock after order and check for low stock
  async updateProductStock(productId, quantityOrdered) {
    try {
      // Get current product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, vendor_id, last_stock_notification')
        .eq('id', productId)
        .single();
      
      if (productError || !product) {
        console.error('Product not found for stock update:', productError);
        return false;
      }
      
      const newStockQuantity = Math.max(0, product.stock_quantity - quantityOrdered);
      
      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStockQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);
      
      if (updateError) {
        console.error('Error updating product stock:', updateError);
        return false;
      }
      
      console.log(`Updated product ${productId} stock: ${product.stock_quantity} -> ${newStockQuantity}`);
      
      // Check if we need to send stock notifications
      await this.checkAndSendStockNotifications(productId, product.vendor_id, newStockQuantity, product.last_stock_notification);
      
      return true;
    } catch (error) {
      console.error('Error in updateProductStock:', error);
      return false;
    }
  }
  
  // Check stock levels and send notifications if needed
  async checkAndSendStockNotifications(productId, vendorId, currentStock, lastNotification) {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      
      // Parse last notification date
      const lastNotificationDate = lastNotification ? new Date(lastNotification) : null;
      
      // Only send notification if we haven't sent one in the last hour for this product
      if (lastNotificationDate && lastNotificationDate > oneHourAgo) {
        console.log(`Stock notification already sent recently for product ${productId}`);
        return;
      }
      
      // Send notification for out of stock (0) or low stock (1)
      if (currentStock === 0 || currentStock === 1) {
        console.log(`Sending stock notification for product ${productId}: ${currentStock} units left`);
        
        const emailSent = await emailService.sendStockNotification(vendorId, productId, currentStock);
        
        if (emailSent) {
          // Update last notification timestamp
          await supabase
            .from('products')
            .update({ 
              last_stock_notification: now.toISOString()
            })
            .eq('id', productId);
          
          console.log(`Stock notification sent and recorded for product ${productId}`);
        }
      }
    } catch (error) {
      console.error('Error checking stock notifications:', error);
    }
  }
  
  // Manually check all products for low stock (can be run as a cron job)
  async checkAllProductsForLowStock() {
    try {
      console.log('Starting bulk stock check...');
      
      // Get all products with stock <= 1
      const { data: lowStockProducts, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, vendor_id, last_stock_notification')
        .lte('stock_quantity', 1)
        .gt('stock_quantity', -1); // Exclude products with negative stock
      
      if (error) {
        console.error('Error fetching low stock products:', error);
        return false;
      }
      
      console.log(`Found ${lowStockProducts?.length || 0} products with low stock`);
      
      // Process each low stock product
      for (const product of lowStockProducts || []) {
        await this.checkAndSendStockNotifications(
          product.id,
          product.vendor_id,
          product.stock_quantity,
          product.last_stock_notification
        );
        
        // Add small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Bulk stock check completed');
      return true;
    } catch (error) {
      console.error('Error in bulk stock check:', error);
      return false;
    }
  }
  
  // Get low stock products for a vendor
  async getVendorLowStockProducts(vendorId, threshold = 5) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, sku')
        .eq('vendor_id', vendorId)
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });
      
      if (error) {
        console.error('Error fetching vendor low stock products:', error);
        return [];
      }
      
      return products || [];
    } catch (error) {
      console.error('Error in getVendorLowStockProducts:', error);
      return [];
    }
  }
}

module.exports = new StockService();