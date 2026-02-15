const { Notification } = require('../models');
const { getIO } = require('../socket');

async function createNotification({ userId, type, title, message, metadata = null }) {
  const notification = await Notification.create({ userId, type, title, message, metadata });

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
  } catch (error) {
    // socket server may be unavailable in non-http runtime paths
  }

  return notification;
}

module.exports = {
  createNotification,
};
