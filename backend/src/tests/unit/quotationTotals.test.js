const calculateQuotationTotals = require('../../utils/quotationTotals');

test('calculates authoritative subtotal, discount, tax, and total', () => {
  const lines = [{ quantity: 2, unitPrice: 100, discountPercent: 10, taxRate: 18 }];
  expect(calculateQuotationTotals(lines)).toEqual({
    subtotal: 200,
    totalDiscount: 20,
    taxAmount: 32.4,
    totalAmount: 212.4
  });
  expect(lines[0].total).toBe(212.4);
});