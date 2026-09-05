const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

const router = express.Router();

module.exports = router;

router.get('/stats', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), getStats);
