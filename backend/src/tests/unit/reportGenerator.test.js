const { buildSalesReport } = require('../../utils/reportGenerator');

test('builds report totals by status and representative', () => {
  const report = buildSalesReport([
    { status: 'confirmed', totalAmount: 100, salesRep: { name: 'A' } },
    { status: 'draft', totalAmount: 50, salesRep: { name: 'A' } }
  ]);
  expect(report.totalQuotes).toBe(2);
  expect(report.totalValue).toBe(150);
  expect(report.byStatus.confirmed).toBe(1);
  expect(report.byRep.A).toBe(150);
});