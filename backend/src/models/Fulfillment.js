const mongoose = require('mongoose');

const fulfillmentSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  split: [{
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number, status: { type: String, enum: ['fulfilled', 'backorder'] } }]
  }],
  backorders: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number, estimatedRestock: Date }],
  status: { type: String, enum: ['suggested', 'reserved', 'in-progress', 'completed'], default: 'suggested' }
}, { timestamps: true });

module.exports = mongoose.model('Fulfillment', fulfillmentSchema);
