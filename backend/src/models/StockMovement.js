const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  movementType: { type: String, enum: ['receipt', 'reservation', 'release', 'adjustment'], required: true },
  reference: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

stockMovementSchema.index({ warehouse: 1, product: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
