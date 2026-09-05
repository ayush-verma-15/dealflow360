const calculateDealHealth = require('../../utils/dealHealth');

test('detects stalled and anomalous deals with explainable scores', () => {
  const health = calculateDealHealth({
    updatedAt: new Date('2026-01-01'),
    subtotal: 1000,
    totalDiscount: 300,
    warehouseSplit: []
  }, 10, new Date('2026-01-10'));
  expect(health.stalledScore).toBe(90);
  expect(health.discountAnomalyScore).toBe(100);
  expect(health.riskScore).toBe(100);
});