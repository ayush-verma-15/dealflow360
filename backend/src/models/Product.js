
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    enum: ['Hardware', 'Software', 'Service', 'Subscription'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price'],
    min: 0
  },
  unit: {
    type: String,
    default: 'unit'
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  margin: {
    type: Number,
    default: 30,
    min: 0,
    max: 100
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  variants: [{
    attribute: {
      type: String,
      required: true
    },
    values: [{
      type: String,
      required: true
    }],
    extraPrice: {
      type: Number,
      default: 0
    }
  }],
  subscriptionPlan: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly']
    },
    price: {
      type: Number,
      min: 0
    },
    prorationRule: {
      type: String,
      enum: ['full', 'pro-rata'],
      default: 'pro-rata'
    }
  },
  coPurchaseHistory: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
