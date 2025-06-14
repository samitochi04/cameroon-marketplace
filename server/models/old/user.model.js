const supabase = require('../config/supabase');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || 'customer';
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new User(data);
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return new User(data);
  }

  async save() {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: this.id,
        email: this.email,
        name: this.name,
        role: this.role,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new User(data);
  }

  hasRole(role) {
    return this.role === role;
  }

  // Additional methods as needed
}

module.exports = User;