// NISHANK - Warehouse Model
const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a warehouse name'],
    trim: true
  },
  code: {
    type: String,
    unique: true
  },
  location: {
    address: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  stock: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    minThreshold: {
      type: Number,
      default: 5
    },
    maxThreshold: {
      type: Number,
      default: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  shippingCostWeight: {
    type: Number,
    default: 1,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxCapacity: {
    type: Number,
    default: 1000
  }
}, {
  timestamps: true
});

// Generate warehouse code before saving
warehouseSchema.pre('save', function(next) {
  if (!this.code) {
    const prefix = this.location.city.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `${prefix}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Warehouse', warehouseSchema);