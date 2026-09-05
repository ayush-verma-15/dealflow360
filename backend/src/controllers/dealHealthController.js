const Quotation = require('../models/Quotation');
const DealHealthAlert = require('../models/DealHealthAlert');
const calculateDealHealth = require('../utils/dealHealth');

exports.getDealHealth = async (req, res) => {
  const scope = req.user.role === 'sales_rep' ? { salesRep: req.user.id } : {};
  const quotations = await Quotation.find(scope).populate('salesRep', 'name').lean();
  const alerts = [];

  for (const quotation of quotations) {
    const repQuotes = quotations.filter((quote) => quote.salesRep?._id?.toString() === quotation.salesRep?._id?.toString());
    const historicalAverage = repQuotes.length
      ? repQuotes.reduce((sum, quote) => sum + (quote.subtotal ? (quote.totalDiscount / quote.subtotal) * 100 : 0), 0) / repQuotes.length
      : 10;
    const health = calculateDealHealth(quotation, historicalAverage);
    const candidates = [
      health.stalledScore >= 50 && { type: 'stalled', severity: health.stalledScore >= 80 ? 'high' : 'medium', message: `Quote inactive for ${health.inactiveDays} days`, score: health.stalledScore },
      health.discountAnomalyScore >= 40 && { type: 'discount-anomaly', severity: health.discountAnomalyScore >= 75 ? 'high' : 'medium', message: `Discount ${health.currentDiscount}% exceeds rep average ${health.historicalAverageDiscount.toFixed(2)}%`, score: health.discountAnomalyScore },
      health.deliveryRiskScore > 0 && { type: 'delivery-risk', severity: 'high', message: 'Quotation contains backordered inventory', score: health.deliveryRiskScore }
    ].filter(Boolean);
    for (const alert of candidates) {
      await DealHealthAlert.findOneAndUpdate(
        { quotation: quotation._id, type: alert.type },
        { ...alert, quotation: quotation._id, createdBy: req.user.id, resolved: false },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      alerts.push({ quotation: quotation._id, quoteNumber: quotation.quoteNumber, ...alert, health });
    }
  }

  res.json({ success: true, count: alerts.length, data: alerts });
};
