import api from './api';
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getReport = (params) => api.get('/reports/sales', { params });
export const exportReport = (params, format = 'csv') => api.get(`/reports/sales/export.${format}`, { params, responseType: 'blob' });
export default { getDashboardStats, getReport, exportReport };
