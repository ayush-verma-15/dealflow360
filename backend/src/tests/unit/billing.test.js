const BillingEngine = require('../../utils/billingEngine');

describe('billing engine helpers', () => {
	test('groups revenue by product name', () => {
		const result = BillingEngine.calculateRevenueByProduct([{ lines: [{ productName: 'Laptop', amount: 100 }, { productName: 'Support', amount: 50 }] }, { lines: [{ productName: 'Laptop', amount: 25 }] }]);
		expect(result).toEqual({ Laptop: 125, Support: 50 });
	});
});
