// NISHANK - Product Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getRecommendations
} = require('../controllers/productController');

// All routes are protected
router.use(protect);

// Public (authenticated) routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/recommendations', getRecommendations);

// Admin only routes
router.post('/', authorize('admin'), createProduct);
router.put('/:id', authorize('admin'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

// Stock management
router.patch('/:id/stock', updateStock);

module.exports = router;