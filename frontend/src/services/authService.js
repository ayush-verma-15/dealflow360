import api from './api';
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (payload) => api.post('/auth/register', payload);
export const getCurrentUser = () => api.get('/auth/me');
export const getCustomers = () => api.get('/auth/customers');
export const logout = () => api.post('/auth/logout');
export default { login, register, getCurrentUser, getCustomers, logout };
