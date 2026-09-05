// ROHAN - Invoice Model
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
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
  type: {
    type: String,
    enum: ['one-time', 'subscription', 'mixed'],
    default: 'one-time'
  },
  lines: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: Number,
    unitPrice: Number,
    discountPercent: Number,
    amount: Number,
    tax: Number,
    lineType: {
      type: String,
      enum: ['one-time', 'subscription']
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription'
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'upi', 'cheque', 'cash', 'razorpay', 'stripe'],
    default: 'bank_transfer'
  },
  paymentDate: Date,
  dueDate: {
    type: Date,
    required: true
  },
  notes: String,
  paymentHistory: [{
    amount: Number,
    method: String,
    transactionId: String,
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
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

// Generate invoice number before saving
invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${timestamp}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);