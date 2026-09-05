// NISHANK - Warehouse Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  updateStock,
  getWarehouseSplit,
  getProductStock
} = require('../controllers/warehouseController');

// All routes are protected
router.use(protect);

// Public (authenticated) routes
router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.post('/split', getWarehouseSplit);
router.get('/product/:productId/stock', getProductStock);

// Admin only routes
router.post('/', authorize('admin'), createWarehouse);
router.put('/:id', authorize('admin'), updateWarehouse);
router.delete('/:id', authorize('admin'), deleteWarehouse);

// Stock management
router.patch('/:id/stock', updateStock);

module.exports = router;