const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class OrderItem {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.orderId = data.order_id;
    this.productId = data.product_id;
    this.vendorId = data.vendor_id;
    this.quantity = data.quantity;
    this.price = data.price;
    this.total = data.total;
    this.status = data.status || 'pending';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new OrderItem(data);
  }

  static async findByOrderId(orderId) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data.map(item => new OrderItem(item));
  }

  static async findByVendorId(vendorId) {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(item => new OrderItem(item));
  }

  async save() {
    const { data, error } = await supabase
      .from('order_items')
      .upsert({
        id: this.id,
        order_id: this.orderId,
        product_id: this.productId,
        vendor_id: this.vendorId,
        quantity: this.quantity,
        price: this.price,
        total: this.total,
        status: this.status,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new OrderItem(data);
  }

  async updateStatus(status) {
    this.status = status;
    return await this.save();
  }

  // Additional methods as needed
}

module.exports = OrderItem;