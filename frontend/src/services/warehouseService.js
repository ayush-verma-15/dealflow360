import api from './api';
export const getWarehouses = (params) => api.get('/warehouses', { params });
export const getWarehouseSplit = (items) => api.post('/warehouses/split', { items });
export const updateWarehouseStock = (id, payload) => api.patch(`/warehouses/${id}/stock`, payload);
export default { getWarehouses, getWarehouseSplit, updateWarehouseStock };
