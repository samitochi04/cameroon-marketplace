const supabase = require('../config/supabase');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.parentId = data.parent_id;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Category(data);
  }

  static async findBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return new Category(data);
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(category => new Category(category));
  }

  static async findByParentId(parentId) {
    const query = parentId 
      ? supabase.from('categories').select('*').eq('parent_id', parentId) 
      : supabase.from('categories').select('*').is('parent_id', null);
    
    const { data, error } = await query;

    if (error) throw error;
    return data.map(category => new Category(category));
  }

  async save() {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        id: this.id,
        name: this.name,
        slug: this.slug,
        description: this.description,
        parent_id: this.parentId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Category(data);
  }

  // Additional methods as needed
}

module.exports = Category;