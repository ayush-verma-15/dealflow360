const mongoose = require('mongoose');

const upsellRuleSchema = new mongoose.Schema({
  sourceProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  suggestedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reason: { type: String, required: true, trim: true },
  promotion: { type: String, default: '' },
  marginThreshold: { type: Number, default: 0, min: 0 },
  priority: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

upsellRuleSchema.index({ sourceProduct: 1, suggestedProduct: 1 }, { unique: true });

module.exports = mongoose.model('UpsellRule', upsellRuleSchema);
