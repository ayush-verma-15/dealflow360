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
  getRecommendations,
  createUpsellRule,
  getUpsellRules,
  deleteUpsellRule
} = require('../controllers/productController');

// All routes are protected
router.use(protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'));

// Public (authenticated) routes
router.get('/', getProducts);
router.post('/recommendations', getRecommendations);
router.get('/upsell-rules', authorize('admin', 'sales_manager'), getUpsellRules);
router.post('/upsell-rules', authorize('admin'), createUpsellRule);
router.delete('/upsell-rules/:id', authorize('admin'), deleteUpsellRule);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', authorize('admin'), createProduct);
router.put('/:id', authorize('admin'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

// Stock management
router.patch('/:id/stock', updateStock);

module.exports = router;