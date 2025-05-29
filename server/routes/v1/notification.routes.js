const express = require('express');
const notificationController = require('../../controllers/notification.controller');
const authMiddleware = require('../../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, notificationController.getUserNotifications);
router.get('/unread', authMiddleware, notificationController.getUnreadNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;