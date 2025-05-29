const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.user_id;
    this.status = data.status || 'pending';
    this.totalAmount = data.total_amount;
    this.shippingAddress = data.shipping_address;
    this.billingAddress = data.billing_address;
    this.paymentMethod = data.payment_method;
    this.paymentStatus = data.payment_status || 'pending';
    this.trackingNumber = data.tracking_number;
    this.notes = data.notes;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Order(data);
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(order => new Order(order));
  }

  static async findByStatus(status) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(order => new Order(order));
  }

  async save() {
    const { data, error } = await supabase
      .from('orders')
      .upsert({
        id: this.id,
        user_id: this.userId,
        status: this.status,
        total_amount: this.totalAmount,
        shipping_address: this.shippingAddress,
        billing_address: this.billingAddress,
        payment_method: this.paymentMethod,
        payment_status: this.paymentStatus,
        tracking_number: this.trackingNumber,
        notes: this.notes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Order(data);
  }

  async updateStatus(status) {
    this.status = status;
    return this.save();
  }

  async updatePaymentStatus(paymentStatus) {
    this.paymentStatus = paymentStatus;
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Order;