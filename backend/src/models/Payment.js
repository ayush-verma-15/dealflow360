// ROHAN - Payment Model
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'upi', 'cheque', 'cash', 'razorpay', 'stripe'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'pending_refund'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundDetails: {
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundTransactionId: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate payment number before saving
paymentSchema.pre('save', function(next) {
  if (!this.paymentNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.paymentNumber = `PAY-${timestamp}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);