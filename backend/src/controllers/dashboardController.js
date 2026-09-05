const Quotation = require('../models/Quotation');

exports.getStats = async (req, res) => {
	try {
		const scope = req.user.role === 'sales_rep' ? { salesRep: req.user.id } : {};
		const quotations = await Quotation.find(scope)
			.populate('customer', 'name email tier')
			.populate('salesRep', 'name email')
			.select('status approvalStatus totalAmount blendedRiskScore lines updatedAt customer')
			.lean();

		const activeStatuses = ['draft', 'sent', 'confirmed', 'fulfilled'];
		const activeDeals = quotations.filter((quote) => activeStatuses.includes(quote.status)).length;
		const pendingApprovals = quotations.filter((quote) => ['pending-manager', 'pending-finance'].includes(quote.approvalStatus)).length;
		const approvedQuotes = quotations.filter((quote) => quote.approvalStatus === 'approved' || quote.status === 'confirmed' || quote.status === 'fulfilled').length;
		const totalRevenue = quotations
			.filter((quote) => ['confirmed', 'fulfilled', 'invoiced', 'paid'].includes(quote.status))
			.reduce((sum, quote) => sum + Number(quote.totalAmount || 0), 0);
		const stalledThreshold = Date.now() - (7 * 24 * 60 * 60 * 1000);
		const stalledDeals = quotations
			.filter((quote) => quote.updatedAt && new Date(quote.updatedAt).getTime() < stalledThreshold && !['paid', 'cancelled', 'fulfilled'].includes(quote.status))
			.slice(0, 8)
			.map((quote) => ({
				quoteId: quote._id,
				customerName: quote.customer?.name || 'Customer',
				inactiveDays: Math.floor((Date.now() - new Date(quote.updatedAt).getTime()) / (24 * 60 * 60 * 1000))
			}));

		const anomalies = quotations.flatMap((quote) => (quote.lines || [])
			.filter((line) => Number(line.discountPercent || 0) >= 20)
			.map((line) => ({
				quoteId: quote._id,
				repName: quote.salesRep?.name || 'Sales rep',
				avgDiscount: quotations.filter((item) => item.salesRep?._id?.toString() === quote.salesRep?._id?.toString()).reduce((sum, item) => sum + (item.subtotal ? (item.totalDiscount / item.subtotal) * 100 : 0), 0) / Math.max(1, quotations.filter((item) => item.salesRep?._id?.toString() === quote.salesRep?._id?.toString()).length),
				currentDiscount: line.discountPercent
			}))).slice(0, 8);

		res.status(200).json({
			success: true,
			data: {
				totalQuotes: quotations.length,
				activeDeals,
				pendingApprovals,
				revenue: totalRevenue,
				approvalRate: quotations.length ? Math.round((approvedQuotes / quotations.length) * 100) : 0,
				conversionRate: quotations.length ? Math.round((approvedQuotes / quotations.length) * 100) : 0,
				stalledDeals,
				anomalies
			}
		});
	} catch (error) {
		console.error('Dashboard stats error:', error);
		res.status(500).json({ success: false, message: 'Unable to load dashboard statistics' });
	}
};
