const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  res.json({ success: true, unreadCount, data: notifications });
};

exports.markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: notification });
};

exports.markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.id, readAt: { $exists: false } }, { readAt: new Date() });
  res.json({ success: true, message: 'Notifications marked as read' });
};
