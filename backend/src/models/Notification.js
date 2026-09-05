const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['approval', 'negotiation', 'inventory', 'deal-health', 'billing', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
