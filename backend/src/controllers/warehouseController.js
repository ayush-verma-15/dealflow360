// NISHANK - Warehouse Controller
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const optimizeWarehouseSplit = require('../utils/warehouseSplit');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = async (req, res) => {
  try {
    const { city, isActive } = req.query;

    let query = {};
    if (city) query['location.city'] = city;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const warehouses = await Warehouse.find(query)
      .populate('stock.productId', 'name sku basePrice')
      .sort({ 'location.city': 1 });

    res.status(200).json({
      success: true,
      count: warehouses.length,
      data: warehouses
    });
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single warehouse
// @route   GET /api/warehouses/:id
// @access  Private
exports.getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('stock.productId', 'name sku basePrice');

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private (Admin)
exports.createWarehouse = async (req, res) => {
  try {
    const { name, location, stock, shippingCostWeight, maxCapacity } = req.body;

    // Check if warehouse exists
    const existingWarehouse = await Warehouse.findOne({ 
      'location.city': location.city,
      'location.pincode': location.pincode
    });

    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Warehouse already exists at this location'
      });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      stock: stock || [],
      shippingCostWeight: shippingCostWeight || 1,
      maxCapacity: maxCapacity || 1000
    });

    res.status(201).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private (Admin)
exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedWarehouse
    });
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private (Admin)
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    await warehouse.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Warehouse deleted successfully'
    });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update warehouse stock
// @route   PATCH /api/warehouses/:id/stock
// @access  Private
exports.updateStock = async (req, res) => {
  try {
    const { productId, quantity, operation } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId and quantity'
      });
    }

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found'
      });
    }

    // Find product in stock
    const stockItem = warehouse.stock.find(
      s => s.productId.toString() === productId
    );

    if (operation === 'add') {
      if (stockItem) {
        stockItem.quantity += quantity;
        stockItem.lastUpdated = new Date();
      } else {
        warehouse.stock.push({
          productId: productId,
          quantity: quantity,
          lastUpdated: new Date()
        });
      }
    } else if (operation === 'subtract') {
      if (!stockItem) {
        return res.status(400).json({
          success: false,
          message: 'Product not found in warehouse'
        });
      }
      if (stockItem.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock in warehouse'
        });
      }
      stockItem.quantity -= quantity;
      stockItem.lastUpdated = new Date();
    } else {
      // Set exact quantity
      if (stockItem) {
        stockItem.quantity = quantity;
        stockItem.lastUpdated = new Date();
      } else {
        warehouse.stock.push({
          productId: productId,
          quantity: quantity,
          lastUpdated: new Date()
        });
      }
    }

    await warehouse.save();

    res.status(200).json({
      success: true,
      data: warehouse
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get warehouse split for order
// @route   POST /api/warehouses/split
// @access  Private
exports.getWarehouseSplit = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items'
      });
    }

    // Get product details
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        product: product,
        quantity: item.quantity
      };
    });

    // Get all active warehouses
    const warehouses = await Warehouse.find({ isActive: true })
      .populate('stock.productId');

    // Optimize split
    const splitResult = optimizeWarehouseSplit(orderItems, warehouses);

    res.status(200).json({
      success: true,
      data: splitResult
    });
  } catch (error) {
    console.error('Get warehouse split error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get stock levels for a product across warehouses
// @route   GET /api/warehouses/product/:productId/stock
// @access  Private
exports.getProductStock = async (req, res) => {
  try {
    const { productId } = req.params;

    const warehouses = await Warehouse.find({ isActive: true });
    
    const stockData = warehouses.map(warehouse => {
      const stockItem = warehouse.stock.find(
        s => s.productId.toString() === productId
      );
      return {
        warehouseId: warehouse._id,
        warehouseName: warehouse.name,
        city: warehouse.location.city,
        quantity: stockItem ? stockItem.quantity : 0,
        minThreshold: stockItem ? stockItem.minThreshold : 0,
        maxThreshold: stockItem ? stockItem.maxThreshold : 0
      };
    });

    res.status(200).json({
      success: true,
      data: stockData
    });
  } catch (error) {
    console.error('Get product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};