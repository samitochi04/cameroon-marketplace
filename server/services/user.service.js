const supabase = require('../config/supabase');

class UserService {
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'customer',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('User service - Create user error:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('User service - Get user error:', error);
      throw error;
    }
  }

  // Other user-related database operations
}

module.exports = new UserService();