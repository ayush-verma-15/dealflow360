const { calculateProration, getNextBillingDate } = require('../../utils/prorationHelper');

test('calculates a mid-cycle plan change', () => {
  const result = calculateProration(
    { price: 100 },
    { price: 200 },
    new Date('2026-01-16'),
    new Date('2026-01-01'),
    new Date('2026-01-31')
  );
  expect(result.daysRemaining).toBe(15);
  expect(result.refundAmount).toBe(50);
  expect(result.chargeAmount).toBe(100);
  expect(result.netAdjustment).toBe(50);
});

test('advances quarterly billing dates', () => {
  expect(getNextBillingDate(new Date('2026-01-15'), 'quarterly').toISOString().slice(0, 10)).toBe('2026-04-15');
});