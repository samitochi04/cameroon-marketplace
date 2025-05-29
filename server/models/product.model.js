const supabase = require('../config/supabase');

class Product {
  constructor(data) {
    this.id = data.id;
    this.vendorId = data.vendor_id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.price = data.price;
    this.salePrice = data.sale_price;
    this.stockQuantity = data.stock_quantity;
    this.status = data.status || 'draft';
    this.categoryId = data.category_id;
    this.images = data.images || [];
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Product(data);
  }

  static async findBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return new Product(data);
  }

  static async findByVendor(vendorId, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', status);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  static async findByCategory(categoryId, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', status);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  static async search(query, status = 'published') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', status)
      .ilike('name', `%${query}%`);

    if (error) throw error;
    return data.map(product => new Product(product));
  }

  async save() {
    const { data, error } = await supabase
      .from('products')
      .upsert({
        id: this.id,
        vendor_id: this.vendorId,
        name: this.name,
        slug: this.slug,
        description: this.description,
        price: this.price,
        sale_price: this.salePrice,
        stock_quantity: this.stockQuantity,
        status: this.status,
        category_id: this.categoryId,
        images: this.images,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Product(data);
  }

  async updateStock(quantity) {
    this.stockQuantity = quantity;
    return this.save();
  }

  async publish() {
    this.status = 'published';
    return this.save();
  }

  async archive() {
    this.status = 'archived';
    return this.save();
  }

  // Additional methods as needed
}

module.exports = Product;