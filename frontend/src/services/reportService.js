import api from './api';
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getReport = (params) => api.get('/reports', { params });
export const exportReport = (params) => api.get('/reports/export', { params, responseType: 'blob' });
export default { getDashboardStats, getReport, exportReport };
