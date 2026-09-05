const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getSalesReport, exportSalesCsv, exportSalesPdf } = require('../controllers/reportController');

const router = express.Router();
router.get('/sales', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance'), getSalesReport);
router.get('/sales/export.csv', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance'), exportSalesCsv);
router.get('/sales/export.pdf', protect, authorize('admin', 'sales_manager', 'sales_rep', 'finance'), exportSalesPdf);

module.exports = router;