const buildSalesReport = (quotations = []) => {
	const report = { totalQuotes: quotations.length, totalValue: 0, byStatus: {}, byRep: {} };
	quotations.forEach((quote) => {
		report.totalValue += Number(quote.totalAmount || 0);
		report.byStatus[quote.status] = (report.byStatus[quote.status] || 0) + 1;
		const rep = quote.salesRep?.name || quote.salesRep?.email || 'Unknown';
		report.byRep[rep] = (report.byRep[rep] || 0) + Number(quote.totalAmount || 0);
	});
	return report;
};

module.exports = { buildSalesReport };
