const supabase = require('../config/supabase');

class Vendor {
  constructor(data) {
    this.id = data.id;
    this.storeName = data.store_name;
    this.description = data.description;
    this.logoUrl = data.logo_url;
    this.bannerUrl = data.banner_url;
    this.status = data.status || 'pending';
    this.commissionRate = data.commission_rate || 10.0; // Default 10%
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Vendor(data);
  }

  static async findByStatus(status) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', status);

    if (error) throw error;
    return data.map(vendor => new Vendor(vendor));
  }

  async save() {
    const { data, error } = await supabase
      .from('vendors')
      .upsert({
        id: this.id,
        store_name: this.storeName,
        description: this.description,
        logo_url: this.logoUrl,
        banner_url: this.bannerUrl,
        status: this.status,
        commission_rate: this.commissionRate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Vendor(data);
  }

  async updateStatus(status) {
    this.status = status;
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Vendor;