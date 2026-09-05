const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDealHealth } = require('../controllers/dealHealthController');

const router = express.Router();
router.get('/', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), getDealHealth);

module.exports = router;