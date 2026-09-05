const router = require('../../routes/quotationRoutes');

test('quotation router exposes CRUD, approval, risk, and negotiation routes', () => {
	const paths = router.stack.map((layer) => layer.route?.path).filter(Boolean);
	expect(paths).toEqual(expect.arrayContaining(['/', '/:id', '/:id/approve', '/:id/reject', '/:id/risk', '/:id/negotiate', '/:id/confirm']));
});
