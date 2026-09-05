import api from './api';
export const getInvoices = (params) => api.get('/billing/invoices', { params });
export const getInvoice = (id) => api.get(`/billing/invoice/${id}`);
export const generateBilling = (quoteId) => api.post(`/billing/generate/${quoteId}`);
export const processPayment = (invoiceId, payload) => api.post(`/billing/payment/${invoiceId}`, payload);
export default { getInvoices, getInvoice, generateBilling, processPayment };
