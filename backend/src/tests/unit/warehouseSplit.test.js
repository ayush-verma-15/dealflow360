const optimizeWarehouseSplit = require('../../utils/warehouseSplit');

describe('warehouse split optimizer', () => {
	const warehouses = [
		{ _id: 'east', name: 'East', shippingCostWeight: 1, location: { city: 'Pune' }, stock: [{ productId: 'p1', quantity: 2 }] },
		{ _id: 'main', name: 'Main', shippingCostWeight: 2, location: { city: 'Mumbai' }, stock: [{ productId: 'p1', quantity: 4 }] }
	];

	test('uses cheapest warehouse first and reports fulfillment', () => {
		const result = optimizeWarehouseSplit([{ product: { _id: 'p1', name: 'Laptop' }, quantity: 5 }], warehouses);
		expect(result.totalItemsFulfilled).toBe(5);
		expect(result.fulfillmentRate).toBe(100);
		expect(result.split[0].warehouse.toString()).toBe('east');
	});

	test('creates a backorder when stock is insufficient', () => {
		const result = optimizeWarehouseSplit([{ product: { _id: 'p1', name: 'Laptop' }, quantity: 9 }], warehouses);
		expect(result.totalItemsFulfilled).toBe(6);
		expect(result.backorders[0].quantity).toBe(3);
	});
});
