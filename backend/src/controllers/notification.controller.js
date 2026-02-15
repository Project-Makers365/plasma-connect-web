const { Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  res.json({ count: notifications.length, unreadCount, notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!notification) {
    throw new HttpError(404, 'Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ message: 'Notification marked as read', notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } },
  );

  res.json({ message: 'All notifications marked as read' });
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
