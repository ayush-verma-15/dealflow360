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
  getProductStock,
  getStockMovements
} = require('../controllers/warehouseController');

// All routes are protected
router.use(protect);

// Public (authenticated) routes
router.get('/', getWarehouses);
router.post('/split', getWarehouseSplit);
router.get('/product/:productId/stock', getProductStock);
router.get('/stock-movements', authorize('admin', 'operations'), getStockMovements);
router.get('/:id', getWarehouse);

// Admin only routes
router.post('/', authorize('admin'), createWarehouse);
router.put('/:id', authorize('admin'), updateWarehouse);
router.delete('/:id', authorize('admin'), deleteWarehouse);

// Stock management
router.patch('/:id/stock', authorize('admin', 'operations'), updateStock);

module.exports = router;