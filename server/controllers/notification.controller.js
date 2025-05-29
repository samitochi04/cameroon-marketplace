const notificationService = require('../services/notification.service');

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await notificationService.getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message,
    });
  }
};

exports.getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await notificationService.getUnreadNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread notifications',
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};