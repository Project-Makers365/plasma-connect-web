const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);
router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

module.exports = router;
