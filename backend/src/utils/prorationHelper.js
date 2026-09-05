// ROHAN - Proration Helper
/**
 * Helper functions for subscription proration calculations
 */

/**
 * Calculate proration for mid-cycle subscription changes
 * @param {Object} oldPlan - Current subscription plan
 * @param {Object} newPlan - New subscription plan
 * @param {Date} changeDate - Date of change
 * @param {Date} billingCycleStart - Start of current billing cycle
 * @param {Date} billingCycleEnd - End of current billing cycle
 * @returns {Object} Proration details
 */
function calculateProration(oldPlan, newPlan, changeDate, billingCycleStart, billingCycleEnd) {
  // Calculate total days in billing cycle
  const totalDays = Math.ceil((billingCycleEnd - billingCycleStart) / (1000 * 60 * 60 * 24));
  
  // Calculate days used so far
  const daysUsed = Math.ceil((changeDate - billingCycleStart) / (1000 * 60 * 60 * 24));
  
  // Calculate days remaining
  const daysRemaining = Math.max(0, totalDays - daysUsed);
  
  // Calculate daily rates
  const oldDailyRate = oldPlan.price / totalDays;
  const newDailyRate = newPlan.price / totalDays;
  
  // Calculate amounts
  const refundAmount = oldDailyRate * daysRemaining;
  const chargeAmount = newDailyRate * daysRemaining;
  const netAdjustment = chargeAmount - refundAmount;
  
  return {
    totalDays,
    daysUsed,
    daysRemaining,
    oldDailyRate,
    newDailyRate,
    refundAmount: Math.round(refundAmount * 100) / 100,
    chargeAmount: Math.round(chargeAmount * 100) / 100,
    netAdjustment: Math.round(netAdjustment * 100) / 100,
    isProrated: daysUsed > 0 && daysRemaining > 0
  };
}

/**
 * Calculate next billing date
 * @param {Date} currentDate - Current billing date
 * @param {String} frequency - monthly, quarterly, yearly
 * @returns {Date} Next billing date
 */
function getNextBillingDate(currentDate, frequency) {
  const nextDate = new Date(currentDate);
  
  switch(frequency) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

/**
 * Calculate refund amount for subscription cancellation
 * @param {Number} monthlyAmount - Monthly subscription amount
 * @param {Date} startDate - Subscription start date
 * @param {Date} endDate - Subscription end date (cancellation date)
 * @param {String} frequency - monthly, quarterly, yearly
 * @returns {Number} Refund amount
 */
function calculateCancellationRefund(monthlyAmount, startDate, endDate, frequency) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total billing period
  let totalMonths = 1;
  switch(frequency) {
    case 'monthly':
      totalMonths = 1;
      break;
    case 'quarterly':
      totalMonths = 3;
      break;
    case 'yearly':
      totalMonths = 12;
      break;
    default:
      totalMonths = 1;
  }
  
  const totalAmount = monthlyAmount * totalMonths;
  const totalDays = totalMonths * 30;
  
  // Calculate days used
  const daysUsed = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysUsed);
  
  // Calculate refund (pro-rata)
  const dailyRate = totalAmount / totalDays;
  const refundAmount = dailyRate * daysRemaining;
  
  return Math.round(refundAmount * 100) / 100;
}

/**
 * Format billing schedule for display
 * @param {Array} schedule - Array of billing events
 * @returns {Array} Formatted schedule
 */
function formatBillingSchedule(schedule) {
  return schedule.map(event => ({
    ...event,
    formattedDate: new Date(event.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    formattedAmount: `₹${event.amount.toLocaleString()}`,
    statusLabel: event.status === 'paid' ? '✅ Paid' : 
                 event.status === 'pending' ? '⏳ Pending' : 
                 event.status === 'failed' ? '❌ Failed' : '📅 Upcoming'
  }));
}

module.exports = {
  calculateProration,
  getNextBillingDate,
  calculateCancellationRefund,
  formatBillingSchedule
};