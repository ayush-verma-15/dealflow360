// ROHAN - Billing Engine (Core Logic)
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');

class BillingEngine {
  
  // 🔥 Main function - Generate complete billing schedule
  static async generateBillingSchedule(quotationId) {
    try {
      const quotation = await Quotation.findById(quotationId)
        .populate('lines.product')
        .populate('customer');
      
      if (!quotation) {
        throw new Error('Quotation not found');
      }

      const existingInvoice = await Invoice.findOne({ quotation: quotation._id });
      const existingSubscriptions = await Subscription.find({ quotation: quotation._id });
      if (existingInvoice || existingSubscriptions.length > 0) {
        return {
          quotationId: quotation._id,
          oneTimeInvoice: existingInvoice,
          subscriptionSchedule: existingSubscriptions.map((subscription) => ({
            subscriptionId: subscription._id,
            productName: subscription.planName,
            frequency: subscription.frequency,
            startDate: subscription.startDate,
            nextBillingDate: subscription.nextBillingDate,
            amount: subscription.amount,
            status: subscription.status
          })),
          oneTimeTotal: existingInvoice?.totalAmount || 0,
          subscriptionTotal: existingSubscriptions.reduce((sum, item) => sum + item.amount, 0),
          totalAmount: (existingInvoice?.totalAmount || 0) + existingSubscriptions.reduce((sum, item) => sum + item.amount, 0),
          nextBillingDate: existingSubscriptions[0]?.nextBillingDate || null
        };
      }
      
      // Separate one-time and subscription lines
      const oneTimeLines = quotation.lines.filter(l => l.lineType === 'one-time');
      const subscriptionLines = quotation.lines.filter(l => l.lineType === 'subscription');
      
      // Generate one-time invoice
      let oneTimeInvoice = null;
      if (oneTimeLines.length > 0) {
        oneTimeInvoice = await this.generateOneTimeInvoice(quotation, oneTimeLines);
      }
      
      // Generate subscription schedule
      let subscriptionSchedule = [];
      if (subscriptionLines.length > 0) {
        subscriptionSchedule = await this.generateSubscriptionSchedule(quotation, subscriptionLines);
      }
      
      // Calculate totals
      const oneTimeTotal = oneTimeInvoice ? oneTimeInvoice.totalAmount : 0;
      const subscriptionTotal = subscriptionSchedule.reduce((sum, s) => sum + s.amount, 0);
      
      return {
        quotationId: quotation._id,
        oneTimeInvoice,
        subscriptionSchedule,
        oneTimeTotal,
        subscriptionTotal,
        totalAmount: oneTimeTotal + subscriptionTotal,
        nextBillingDate: subscriptionSchedule.length > 0 ? subscriptionSchedule[0].nextBillingDate : null
      };
      
    } catch (error) {
      console.error('Billing generation error:', error);
      throw error;
    }
  }
  
  // 📝 Generate one-time invoice
  static async generateOneTimeInvoice(quotation, lines) {
    try {
      let subtotal = 0;
      let totalTax = 0;
      
      const invoiceLines = lines.map(line => {
        const product = line.product;
        const amount = line.quantity * line.unitPrice * (1 - line.discountPercent / 100);
        const tax = amount * ((product.taxRate || 0) / 100);
        
        subtotal += amount;
        totalTax += tax;
        
        return {
          product: product._id,
          productName: product.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent,
          amount: amount,
          tax: tax,
          lineType: 'one-time'
        };
      });
      
      const totalAmount = subtotal + totalTax;
      
      // Create invoice
      const invoice = new Invoice({
        quotation: quotation._id,
        customer: quotation.customer._id,
        type: quotation.lines.some(line => line.lineType === 'subscription') ? 'mixed' : 'one-time',
        lines: invoiceLines,
        subtotal: subtotal,
        totalTax: totalTax,
        totalAmount: totalAmount,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days due
        status: 'sent'
      });
      
      await invoice.save();
      
      // Update quotation with invoice reference
      quotation.invoice = invoice._id;
      quotation.status = 'invoiced';
      await quotation.save();
      
      return invoice;
      
    } catch (error) {
      console.error('Invoice generation error:', error);
      throw error;
    }
  }
  
  // 📅 Generate subscription schedule
  static async generateSubscriptionSchedule(quotation, lines) {
    try {
      const subscriptions = [];
      
      for (const line of lines) {
        const product = line.product;
        const plan = product.subscriptionPlan || {
          frequency: 'monthly',
          price: line.unitPrice
        };
        
        const startDate = new Date();
        const nextBilling = new Date(startDate);
        
        // Calculate next billing date based on frequency
        switch(plan.frequency) {
          case 'monthly':
            nextBilling.setMonth(nextBilling.getMonth() + 1);
            break;
          case 'quarterly':
            nextBilling.setMonth(nextBilling.getMonth() + 3);
            break;
          case 'yearly':
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
            break;
          default:
            nextBilling.setMonth(nextBilling.getMonth() + 1);
        }
        
        const amount = line.quantity * (plan.price || line.unitPrice) * (1 - line.discountPercent / 100);
        
        // Create subscription
        const subscription = new Subscription({
          quotation: quotation._id,
          customer: quotation.customer._id,
          product: product._id,
          planName: product.name,
          frequency: plan.frequency,
          amount: amount,
          quantity: line.quantity,
          startDate: startDate,
          nextBillingDate: nextBilling,
          status: 'active',
          autoRenew: true
        });
        
        await subscription.save();
        
        subscriptions.push({
          subscriptionId: subscription._id,
          productName: product.name,
          frequency: plan.frequency,
          startDate: startDate,
          nextBillingDate: nextBilling,
          amount: amount,
          status: 'active'
        });
      }
      
      return subscriptions;
      
    } catch (error) {
      console.error('Subscription generation error:', error);
      throw error;
    }
  }
  
  // 🔄 Handle proration for mid-cycle changes
  static async handleProration(subscriptionId, newPlan, changeDate) {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('product');
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Calculate days remaining in current billing cycle
      const today = new Date(changeDate || Date.now());
      const nextBilling = new Date(subscription.nextBillingDate);
      const totalDays = (nextBilling - subscription.startDate) / (1000 * 60 * 60 * 24);
      const daysUsed = (today - subscription.startDate) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.max(0, totalDays - daysUsed);
      
      // Calculate prorated amount
      const oldDailyRate = subscription.amount / totalDays;
      const newDailyRate = newPlan.price / totalDays;
      
      // Refund for remaining days on old plan
      const refundAmount = oldDailyRate * daysRemaining;
      
      // Charge for remaining days on new plan
      const chargeAmount = newDailyRate * daysRemaining;
      
      // Net adjustment
      const netAdjustment = chargeAmount - refundAmount;
      
      // Log proration
      subscription.prorationHistory.push({
        previousPlan: subscription.planName,
        newPlan: newPlan.name,
        proratedAmount: netAdjustment,
        effectiveDate: today,
        reason: 'Plan change'
      });
      
      // Update subscription
      subscription.amount = newPlan.price;
      subscription.planName = newPlan.name;
      subscription.nextBillingDate = new Date(today.setMonth(today.getMonth() + 1));
      
      await subscription.save();
      
      return {
        subscriptionId: subscription._id,
        refundAmount: refundAmount,
        chargeAmount: chargeAmount,
        netAdjustment: netAdjustment,
        newMonthlyAmount: newPlan.price,
        nextBillingDate: subscription.nextBillingDate
      };
      
    } catch (error) {
      console.error('Proration error:', error);
      throw error;
    }
  }
  
  // ❌ Cancel subscription
  static async cancelSubscription(subscriptionId, cancelDate, reason) {
    try {
      const subscription = await Subscription.findById(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      if (subscription.status === 'cancelled') {
        throw new Error('Subscription already cancelled');
      }
      
      // Calculate refund for unused period
      const today = new Date(cancelDate || Date.now());
      const nextBilling = new Date(subscription.nextBillingDate);
      const totalDays = (nextBilling - subscription.startDate) / (1000 * 60 * 60 * 24);
      const daysUsed = (today - subscription.startDate) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.max(0, totalDays - daysUsed);
      
      // Daily rate refund
      const dailyRate = subscription.amount / totalDays;
      const refundAmount = dailyRate * daysRemaining;
      
      // Update subscription status
      subscription.status = 'cancelled';
      subscription.endDate = today;
      subscription.cancellationDetails = {
        reason: reason || 'Customer requested cancellation',
        cancelledAt: today,
        refundAmount: refundAmount,
        refundStatus: refundAmount > 0 ? 'pending' : 'processed'
      };
      
      await subscription.save();
      
      // Generate credit note if refund is due
      let creditNote = null;
      if (refundAmount > 0) {
        creditNote = {
          amount: refundAmount,
          reason: `Subscription cancelled: ${reason || 'Customer request'}`,
          date: today,
          customerId: subscription.customer
        };
        // Credit note generation logic here
      }
      
      return {
        subscriptionId: subscription._id,
        status: 'cancelled',
        endDate: today,
        refundAmount: refundAmount,
        creditNote: creditNote
      };
      
    } catch (error) {
      console.error('Cancellation error:', error);
      throw error;
    }
  }
  
  // 💳 Process payment
  static async processPayment(invoiceId, paymentDetails) {
    try {
      const invoice = await Invoice.findById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      
      if (invoice.status === 'paid') {
        throw new Error('Invoice already paid');
      }
      
      // Simulate payment processing
      // In real world, integrate with payment gateway
      const payment = new Payment({
        invoice: invoice._id,
        customer: invoice.customer,
        amount: invoice.totalAmount,
        method: paymentDetails.method || 'bank_transfer',
        status: 'success',
        transactionId: `TXN-${Date.now()}`,
        paymentDate: new Date(),
        metadata: {
          source: paymentDetails.source || 'manual',
          notes: paymentDetails.notes || ''
        }
      });
      
      await payment.save();
      
      // Update invoice status
      invoice.status = 'paid';
      invoice.paymentDate = new Date();
      invoice.paymentMethod = paymentDetails.method || 'bank_transfer';
      invoice.paymentHistory.push({
        amount: payment.amount,
        method: payment.method,
        transactionId: payment.transactionId,
        status: 'success',
        date: payment.paymentDate
      });
      await invoice.save();
      
      // Update quotation status
      const quotation = await Quotation.findById(invoice.quotation);
      if (quotation) {
        quotation.status = 'paid';
        await quotation.save();
      }
      
      return {
        paymentId: payment._id,
        invoiceId: invoice._id,
        amount: payment.amount,
        status: 'paid',
        transactionId: payment.transactionId
      };
      
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }
  
  // 📊 Generate billing reports
  static async generateBillingReport(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Get all invoices in date range
      const invoices = await Invoice.find({
        createdAt: { $gte: start, $lte: end },
        status: 'paid'
      }).populate('customer');
      
      // Get all active subscriptions
      const subscriptions = await Subscription.find({
        status: 'active'
      }).populate('customer');
      
      // Calculate MRR (Monthly Recurring Revenue)
      let mrr = 0;
      subscriptions.forEach(sub => {
        if (sub.frequency === 'monthly') {
          mrr += sub.amount;
        } else if (sub.frequency === 'quarterly') {
          mrr += sub.amount / 3;
        } else if (sub.frequency === 'yearly') {
          mrr += sub.amount / 12;
        }
      });
      
      // Calculate total revenue
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      
      // Calculate churn rate
      const cancelledSubs = await Subscription.find({
        status: 'cancelled',
        endDate: { $gte: start, $lte: end }
      });
      
      const churnRate = subscriptions.length > 0 
        ? (cancelledSubs.length / (subscriptions.length + cancelledSubs.length)) * 100 
        : 0;
      
      return {
        period: { startDate, endDate },
        totalRevenue,
        mrr,
        churnRate: Math.round(churnRate * 10) / 10,
        totalInvoices: invoices.length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        revenueByProduct: this.calculateRevenueByProduct(invoices),
        averageOrderValue: invoices.length > 0 ? totalRevenue / invoices.length : 0
      };
      
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }
  
  // 📈 Revenue by product
  static calculateRevenueByProduct(invoices) {
    const revenueMap = {};
    
    invoices.forEach(invoice => {
      invoice.lines.forEach(line => {
        const productName = line.productName || 'Unknown';
        if (!revenueMap[productName]) {
          revenueMap[productName] = 0;
        }
        revenueMap[productName] += line.amount;
      });
    });
    
    return revenueMap;
  }
}

module.exports = BillingEngine;