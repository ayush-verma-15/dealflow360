const isPositiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;

const validateQuotationLines = (lines) => {
	if (!Array.isArray(lines) || lines.length === 0) return ['At least one quotation line is required'];
	const errors = [];
	lines.forEach((line, index) => {
		if (!line.productId) errors.push(`Line ${index + 1}: productId is required`);
		if (!Number.isInteger(Number(line.quantity)) || Number(line.quantity) < 1) errors.push(`Line ${index + 1}: quantity must be a positive integer`);
		if (!isPositiveNumber(line.discountPercent) || Number(line.discountPercent) > 100) errors.push(`Line ${index + 1}: discountPercent must be between 0 and 100`);
	});
	return errors;
};

module.exports = { isPositiveNumber, validateQuotationLines };
