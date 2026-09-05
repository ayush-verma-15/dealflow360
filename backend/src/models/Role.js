const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['admin', 'sales_rep', 'sales_manager', 'finance', 'operations', 'customer'],
    unique: true,
    required: true
  },
  permissions: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);