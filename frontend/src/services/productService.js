import api from './api';
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getRecommendations = (productIds) => api.post('/products/recommendations', { productIds });
export const createProduct = (payload) => api.post('/products', payload);
export default { getProducts, getProduct, getRecommendations, createProduct };
