// ROHAN - Billing Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateBillingSchedule,
  getInvoice,
  getInvoices,
  processPayment,
  getSubscriptionSchedule,
  updateSubscription,
  cancelSubscription
} = require('../controllers/billingController');

// All routes are protected
router.use(protect);

// Billing generation
router.post('/generate/:quoteId', generateBillingSchedule);

// Invoice routes
router.get('/invoice/:invoiceId', getInvoice);
router.get('/invoices', getInvoices);

// Payment routes
router.post('/payment/:invoiceId', processPayment);

// Subscription routes
router.get('/subscription/:subscriptionId/schedule', getSubscriptionSchedule);
router.put('/subscription/:subscriptionId', updateSubscription);
router.delete('/subscription/:subscriptionId', cancelSubscription);

module.exports = router;