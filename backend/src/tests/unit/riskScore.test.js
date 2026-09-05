const calculateBlendedRiskScore = require('../../utils/blendedRiskScore');

describe('blended risk score', () => {
	test('approves discounts within the customer tier ceiling', () => {
		const result = calculateBlendedRiskScore([{ quantity: 1, unitPrice: 1000, discountPercent: 5, category: 'Hardware' }], 'Bronze');
		expect(result.approvalLevel).toBe('none');
		expect(result.needsManagerApproval).toBe(false);
	});

	test('routes a moderate violation to a manager', () => {
		const result = calculateBlendedRiskScore([{ quantity: 1, unitPrice: 1000, discountPercent: 8, category: 'Hardware' }], 'Bronze');
		expect(result.approvalLevel).toBe('manager');
		expect(result.needsManagerApproval).toBe(true);
		expect(result.needsFinanceApproval).toBe(false);
	});

	test('routes a high violation to finance', () => {
		const result = calculateBlendedRiskScore([{ quantity: 1, unitPrice: 1000, discountPercent: 12, category: 'Hardware' }], 'Bronze');
		expect(result.approvalLevel).toBe('finance');
		expect(result.needsFinanceApproval).toBe(true);
	});
});
