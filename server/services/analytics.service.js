const supabase = require('../config/supabase');

class AnalyticsService {
  // Admin analytics
  async getPlatformSummary() {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total vendors
      const { count: vendorCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

      return {
        userCount,
        vendorCount,
        productCount,
        orderCount,
        totalRevenue,
      };
    } catch (error) {
      console.error('Analytics service - Get platform summary error:', error);
      throw error;
    }
  }

  async getSalesOverTime(period = '30d') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Format date to ISO string and remove time part
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get orders in the period
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${startDateStr}T00:00:00`)
        .order('created_at', { ascending: true });

      // Group by day
      const salesByDay = {};
      orders.forEach(order => {
        const date = order.created_at.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = {
            count: 0,
            revenue: 0,
          };
        }
        salesByDay[date].count += 1;
        salesByDay[date].revenue += order.total_amount;
      });

      // Convert to array of points
      const result = Object.keys(salesByDay).map(date => ({
        date,
        orderCount: salesByDay[date].count,
        revenue: salesByDay[date].revenue,
      }));

      return result;
    } catch (error) {
      console.error('Analytics service - Get sales over time error:', error);
      throw error;
    }
  }

  async getTopSellingProducts(limit = 10) {
    try {
      // Get order items joined with products
      const { data } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product:products(id, name, price)
        `)
        .order('quantity', { ascending: false })
        .limit(limit);

      // Aggregate quantities for each product
      const productMap = {};
      data.forEach(item => {
        const productId = item.product.id;
        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: item.product.name,
            price: item.product.price,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productMap[productId].totalQuantity += item.quantity;
        productMap[productId].totalRevenue += item.quantity * item.product.price;
      });

      // Convert to array and sort by total quantity
      return Object.values(productMap)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Analytics service - Get top selling products error:', error);
      throw error;
    }
  }

  // Vendor analytics
  async getVendorSummary(vendorId) {
    try {
      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId);

      // Get published products
      const { count: publishedProductCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendorId)
        .eq('status', 'published');

      // Get order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('vendor_id', vendorId);

      // Calculate total orders, revenue, and items sold
      const totalOrders = new Set(orderItems.map(item => item.order_id)).size;
      const totalRevenue = orderItems.reduce((sum, item) => sum + item.total, 0);
      const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        productCount,
        publishedProductCount,
        totalOrders,
        totalRevenue,
        totalItemsSold,
      };
    } catch (error) {
      console.error('Analytics service - Get vendor summary error:', error);
      throw error;
    }
  }

  async getVendorSalesOverTime(vendorId, period = '30d') {
    try {
      let startDate;
      const now = new Date();
      
      switch (period) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Format date to ISO string and remove time part
      const startDateStr = startDate.toISOString().split('T')[0];

      // Get order items in the period, joined with orders for date
      const { data: items } = await supabase
        .from('order_items')
        .select(`
          quantity, total,
          order:orders(created_at)
        `)
        .eq('vendor_id', vendorId)
        .gte('order.created_at', `${startDateStr}T00:00:00`);

      // Group by day
      const salesByDay = {};
      items.forEach(item => {
        const date = item.order.created_at.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = {
            quantity: 0,
            revenue: 0,
          };
        }
        salesByDay[date].quantity += item.quantity;
        salesByDay[date].revenue += item.total;
      });

      // Convert to array of points
      const result = Object.keys(salesByDay).map(date => ({
        date,
        itemsSold: salesByDay[date].quantity,
        revenue: salesByDay[date].revenue,
      }));

      return result;
    } catch (error) {
      console.error('Analytics service - Get vendor sales over time error:', error);
      throw error;
    }
  }

  async getVendorTopProducts(vendorId, limit = 5) {
    try {
      // Group order items by product and sum quantities
      const { data } = await supabase
        .from('order_items')
        .select(`
          quantity, total,
          product:products(id, name)
        `)
        .eq('vendor_id', vendorId);

      // Aggregate by product
      const productMap = {};
      data.forEach(item => {
        const productId = item.product.id;
        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[productId].quantity += item.quantity;
        productMap[productId].revenue += item.total;
      });

      // Convert to array and sort by quantity
      return Object.values(productMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, limit);
    } catch (error) {
      console.error('Analytics service - Get vendor top products error:', error);
      throw error;
    }
  }

  // Additional analytics methods as needed
}

module.exports = new AnalyticsService();