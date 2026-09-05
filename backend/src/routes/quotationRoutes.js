const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createQuotation,
  getQuotations,
  getQuotation,
  updateQuotation,
  approveQuotation,
  rejectQuotation,
  deleteQuotation,
  getRiskScore,
  requestNegotiation,
  confirmQuotation
} = require('../controllers/quotationController');


router.use(protect);

// Main CRUD
router.route('/')
  .post(createQuotation)
  .get(getQuotations);

router.route('/:id')
  .get(getQuotation)
  .put(updateQuotation)
  .delete(deleteQuotation);

// Approval routes
router.post('/:id/approve', approveQuotation);
router.post('/:id/reject', rejectQuotation);

// Risk score
router.get('/:id/risk', getRiskScore);
router.post('/:id/negotiate', requestNegotiation);
router.post('/:id/confirm', confirmQuotation);

module.exports = router;
