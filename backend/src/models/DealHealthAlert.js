const mongoose = require('mongoose');

const dealHealthAlertSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  type: { type: String, enum: ['stalled', 'discount-anomaly', 'delivery-risk'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  message: { type: String, required: true },
  score: { type: Number, min: 0, max: 100, required: true },
  resolved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

dealHealthAlertSchema.index({ quotation: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('DealHealthAlert', dealHealthAlertSchema);
