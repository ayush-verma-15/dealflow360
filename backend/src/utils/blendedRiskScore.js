const CUSTOMER_TIER_CEILINGS = {
	Bronze: 5,
	Silver: 10,
	Gold: 15
};

const CATEGORY_CEILINGS = {
	Hardware: 15,
	Software: 20,
	Service: 25,
	Subscription: 15
};

const calculateBlendedRiskScore = (lines = [], customerTier = 'Bronze') => {
	const tierCeiling = CUSTOMER_TIER_CEILINGS[customerTier] || CUSTOMER_TIER_CEILINGS.Bronze;
	let subtotal = 0;
	let totalViolationValue = 0;
	let maxLineViolation = 0;

	const scoredLines = lines.map((line) => {
		const lineValue = Number(line.quantity || 0) * Number(line.unitPrice || 0);
		const category = line.category || line.productCategory || line.product?.category;
		const categoryCeiling = CATEGORY_CEILINGS[category] || tierCeiling;
		const ceiling = Math.min(tierCeiling, categoryCeiling);
		const discount = Number(line.discountPercent || 0);
		const violation = Math.max(0, discount - ceiling);

		subtotal += lineValue;
		totalViolationValue += lineValue * (violation / 100);
		maxLineViolation = Math.max(maxLineViolation, violation);

		return { ...line, ceiling, violation, lineValue };
	});

	const totalViolation = subtotal ? (totalViolationValue / subtotal) * 100 : 0;
	const weightedViolation = scoredLines.reduce((sum, line) => {
		return sum + (subtotal ? (line.lineValue / subtotal) * line.violation : 0);
	}, 0);
	const needsFinanceApproval = maxLineViolation > 5 || weightedViolation >= 5;
	const needsManagerApproval = maxLineViolation > 0;

	return {
		score: Number(Math.min(100, weightedViolation * 10).toFixed(2)),
		maxLineViolation: Number(maxLineViolation.toFixed(2)),
		totalViolation: Number(totalViolation.toFixed(2)),
		totalWeightedViolation: Number(weightedViolation.toFixed(2)),
		needsManagerApproval,
		needsFinanceApproval,
		approvalLevel: needsFinanceApproval ? 'finance' : needsManagerApproval ? 'manager' : 'none'
	};
};

calculateBlendedRiskScore.CUSTOMER_TIER_CEILINGS = CUSTOMER_TIER_CEILINGS;
calculateBlendedRiskScore.CATEGORY_CEILINGS = CATEGORY_CEILINGS;

module.exports = calculateBlendedRiskScore;
