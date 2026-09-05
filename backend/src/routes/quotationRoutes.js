const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  approveQuotation,
  rejectQuotation,
  returnQuotationForRevision,
  deleteQuotation,
  getRiskScore,
  downloadQuotationPdf,
  requestNegotiation,
  confirmQuotation
} = require('../controllers/quotationController');


router.use(protect);

// Main CRUD
router.route('/')
  .post(authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), createQuotation)
  .get(getQuotations);

router.route('/:id')
  .get(getQuotation)
  .put(authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), updateQuotation)
  .delete(authorize('admin', 'sales_manager', 'sales_rep', 'finance', 'operations'), deleteQuotation);

// Approval routes
router.post('/:id/approve', authorize('admin', 'sales_manager', 'finance'), approveQuotation);
router.post('/:id/reject', authorize('admin', 'sales_manager', 'finance'), rejectQuotation);
router.post('/:id/return-for-revision', authorize('admin', 'sales_manager', 'finance'), returnQuotationForRevision);

// Risk score
router.get('/:id/risk', authorize('admin', 'sales_manager', 'finance', 'sales_rep'), getRiskScore);
router.get('/:id/pdf', downloadQuotationPdf);
router.post('/:id/negotiate', requestNegotiation);
router.post('/:id/confirm', confirmQuotation);

module.exports = router;
