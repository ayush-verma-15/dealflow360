// ROHAN - Billing Controller
const BillingEngine = require('../utils/billingEngine');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Quotation = require('../models/Quotation');

// 🔥 Generate billing schedule
exports.generateBillingSchedule = async (req, res) => {
  try {
    const { quoteId } = req.params;
    
    const billingData = await BillingEngine.generateBillingSchedule(quoteId);
    
    res.status(200).json({
      success: true,
      data: billingData
    });
    
  } catch (error) {
    console.error('Generate billing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate billing schedule'
    });
  }
};

// 📄 Get invoice by ID
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findById(invoiceId)
      .populate('customer', 'name email tier')
      .populate('lines.product', 'name category')
      .populate('quotation', 'quoteNumber');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 📄 Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const { customerId, status, startDate, endDate } = req.query;
    
    let query = {};
    if (customerId) query.customer = customerId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // If sales rep, only show their invoices
    if (req.user.role === 'sales_rep') {
      const quotations = await Quotation.find({ salesRep: req.user.id }).select('_id');
      const quoteIds = quotations.map(q => q._id);
      query.quotation = { $in: quoteIds };
    }
    
    const invoices = await Invoice.find(query)
      .populate('customer', 'name email tier')
      .populate('quotation', 'quoteNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
    
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 💳 Process payment
exports.processPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { method, notes } = req.body;
    
    if (!method) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment method'
      });
    }
    
    const result = await BillingEngine.processPayment(invoiceId, { method, notes });
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
};

// 📅 Get subscription schedule
exports.getSubscriptionSchedule = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findById(subscriptionId)
      .populate('customer', 'name email')
      .populate('product', 'name category');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Generate next 6 months schedule
    const schedule = [];
    let currentDate = new Date(subscription.startDate);
    let amount = subscription.amount;
    
    for (let i = 0; i < 6; i++) {
      const nextDate = new Date(currentDate);
      switch(subscription.frequency) {
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      
      schedule.push({
        date: new Date(nextDate),
        amount: amount,
        status: i === 0 ? 'current' : 'upcoming'
      });
      
      currentDate = nextDate;
    }
    
    res.status(200).json({
      success: true,
      data: {
        subscription,
        schedule
      }
    });
    
  } catch (error) {
    console.error('Get subscription schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// 🔄 Update subscription (with proration)
exports.updateSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPlanPrice, newPlanName, changeDate } = req.body;
    
    if (!newPlanPrice) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new plan price'
      });
    }
    
    const newPlan = {
      name: newPlanName || 'Updated Plan',
      price: newPlanPrice
    };
    
    const result = await BillingEngine.handleProration(
      subscriptionId,
      newPlan,
      changeDate
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subscription'
    });
  }
};

// ❌ Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;
    
    const result = await BillingEngine.cancelSubscription(
      subscriptionId,
      new Date(),
      reason
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
};