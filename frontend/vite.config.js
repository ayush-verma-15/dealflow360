const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		proxy: {
			'/api': 'http://localhost:5000'
		}
	},
	esbuild: {
		loader: 'jsx',
		include: /src\/.*\.(js|jsx)$/
	},
	optimizeDeps: {
		esbuildOptions: {
			loader: {
				'.js': 'jsx'
			}
		}
	}
});
