// ROHAN - Subscription Model
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionNumber: {
    type: String,
    unique: true,
    required: true
  },
  quotation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired', 'pending'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  billingHistory: [{
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    billingDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['generated', 'paid', 'failed', 'pending']
    },
    transactionId: String
  }],
  prorationHistory: [{
    previousPlan: String,
    newPlan: String,
    proratedAmount: Number,
    effectiveDate: Date,
    reason: String
  }],
  cancellationDetails: {
    reason: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
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

// Generate subscription number before saving
subscriptionSchema.pre('save', function(next) {
  if (!this.subscriptionNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.subscriptionNumber = `SUB-${timestamp}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);