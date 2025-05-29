const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class Notification {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.user_id;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.data = data.data || {};
    this.isRead = data.is_read || false;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return new Notification(data);
  }

  static async findByUserId(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(notification => new Notification(notification));
  }

  static async findUnreadByUserId(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(notification => new Notification(notification));
  }

  async save() {
    const { data, error } = await supabase
      .from('notifications')
      .upsert({
        id: this.id,
        user_id: this.userId,
        type: this.type,
        title: this.title,
        message: this.message,
        data: this.data,
        is_read: this.isRead,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return new Notification(data);
  }

  async markAsRead() {
    this.isRead = true;
    return await this.save();
  }

  // Additional methods as needed
}

module.exports = Notification;