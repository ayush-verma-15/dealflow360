// AYUSH - Quotation Model
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  salesRep: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lines: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lineType: {
      type: String,
      enum: ['one-time', 'subscription'],
      required: true
    },
    total: Number,
    marginImpact: Number
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // 🔥 Blended Risk Score
  blendedRiskScore: {
    score: {
      type: Number,
      default: 0
    },
    maxLineViolation: {
      type: Number,
      default: 0
    },
    totalViolation: {
      type: Number,
      default: 0
    },
    totalWeightedViolation: {
      type: Number,
      default: 0
    },
    needsManagerApproval: {
      type: Boolean,
      default: false
    },
    needsFinanceApproval: {
      type: Boolean,
      default: false
    },
    approvalLevel: {
      type: String,
      enum: ['none', 'manager', 'finance'],
      default: 'none'
    }
  },
  
  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending-manager', 'pending-finance', 'approved', 'rejected', 'negotiation'],
    default: 'draft'
  },
  approvalChain: [{
    role: {
      type: String,
      enum: ['manager', 'finance']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  
  // Negotiation
  negotiation: {
    status: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected'],
      default: 'none'
    },
    requestedDiscount: {
      type: Number,
      default: 0
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    finalTerms: {
      discount: Number,
      amount: Number
    }
  },
  
  // Warehouse Split
  warehouseSplit: [{
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse'
    },
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      status: {
        type: String,
        enum: ['fulfilled', 'backorder']
      }
    }],
    shipmentCost: {
      type: Number,
      default: 0
    },
    estimatedDelivery: Date
  }],
  
  // Billing
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'confirmed', 'fulfilled', 'invoiced', 'paid', 'cancelled'],
    default: 'draft'
  },
  
  // Audit Log
  auditLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    changes: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Generate quote number before saving
quotationSchema.pre('save', function(next) {
  if (!this.quoteNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.quoteNumber = `Q-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving
quotationSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalDiscount = 0;
  
  this.lines.forEach(line => {
    const lineTotal = line.quantity * line.unitPrice;
    const lineDiscount = lineTotal * (line.discountPercent / 100);
    line.total = lineTotal - lineDiscount;
    
    subtotal += lineTotal;
    totalDiscount += lineDiscount;
  });
  
  this.subtotal = subtotal;
  this.totalDiscount = totalDiscount;
  this.totalAmount = subtotal - totalDiscount;
  
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);