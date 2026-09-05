// NISHANK - Product Controller
const Product = require('../models/Product');
const mongoose = require('mongoose');
const UpsellRule = require('../models/UpsellRule');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { category, isActive, isPromoted, search, minPrice, maxPrice } = req.query;

    let query = {};
    
    // Filters
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isPromoted !== undefined) query.isPromoted = isPromoted === 'true';
    
    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      basePrice,
      unit,
      taxRate,
      stock,
      margin,
      isPromoted,
      variants,
      subscriptionPlan
    } = req.body;

    // Check if product already exists
    const existingProduct = await Product.findOne({ name, category });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists with this name and category'
      });
    }

    const product = await Product.create({
      name,
      category,
      description: description || '',
      basePrice,
      unit: unit || 'unit',
      taxRate: taxRate || 0,
      stock: stock || 0,
      margin: margin || 30,
      isPromoted: isPromoted || false,
      variants: variants || [],
      subscriptionPlan: subscriptionPlan || null
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid quantity'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (operation === 'add') {
      product.stock += quantity;
    } else if (operation === 'subtract') {
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
      product.stock -= quantity;
    } else {
      product.stock = quantity;
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: {
        productId: product._id,
        name: product.name,
        stock: product.stock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get product recommendations (upsell/cross-sell)
// @route   POST /api/products/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const { productIds, limit = 5 } = req.body;

    if (!productIds || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product IDs'
      });
    }

    const rules = await UpsellRule.find({ sourceProduct: { $in: productIds }, active: true })
      .populate('suggestedProduct')
      .sort({ priority: -1 });

    const recommendations = new Map();
    for (const rule of rules) {
      const product = rule.suggestedProduct;
      if (product?.isActive && !productIds.includes(product._id.toString())) {
        const margin = Number(product.margin || 0);
        if (margin >= rule.marginThreshold) recommendations.set(product._id.toString(), {
          product,
          reason: rule.reason,
          promotion: rule.promotion,
          score: 100 + rule.priority,
          marginDelta: margin
        });
      }
    }

    // Add co-purchase history as a ranking signal when no explicit rule exists.
    const products = await Product.find({
      _id: { $in: productIds }
    });

    // Collect all co-purchased products
    const recommendationsMap = new Map();
    
    for (const product of products) {
      for (const co of product.coPurchaseHistory || []) {
        const key = co.productId.toString();
        if (!productIds.includes(key)) {
          recommendationsMap.set(key, (recommendationsMap.get(key) || 0) + co.count);
        }
      }
    }

    // Sort by count and get top recommendations
    const sorted = Array.from(recommendationsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    // Get product details
    const recommendedProducts = await Product.find({
      _id: { $in: sorted },
      isActive: true
    });

    // Sort by recommendation order
    const ordered = sorted
      .map(id => recommendedProducts.find(p => p._id.toString() === id))
      .filter(p => p)
      .filter((product) => !recommendations.has(product._id.toString()))
      .map((product) => ({ product, reason: 'Frequently purchased together', promotion: product.isPromoted ? 'Active promotion' : '', score: recommendationsMap.get(product._id.toString()), marginDelta: product.margin || 0 }));

    const data = [...recommendations.values(), ...ordered].slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createUpsellRule = async (req, res) => {
  try {
    const rule = await UpsellRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create upsell rule' });
  }
};

exports.getUpsellRules = async (req, res) => {
  const rules = await UpsellRule.find().populate('sourceProduct suggestedProduct').sort({ priority: -1 });
  res.json({ success: true, count: rules.length, data: rules });
};

exports.deleteUpsellRule = async (req, res) => {
  const rule = await UpsellRule.findByIdAndDelete(req.params.id);
  if (!rule) return res.status(404).json({ success: false, message: 'Upsell rule not found' });
  res.json({ success: true, message: 'Upsell rule deleted' });
};