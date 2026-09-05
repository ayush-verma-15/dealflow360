const router = require('../../routes/authRoutes');

test('auth router exposes register, login, and protected profile routes', () => {
	const paths = router.stack.map((layer) => layer.route?.path).filter(Boolean);
	expect(paths).toEqual(expect.arrayContaining(['/register', '/login', '/me', '/logout', '/profile']));
});
