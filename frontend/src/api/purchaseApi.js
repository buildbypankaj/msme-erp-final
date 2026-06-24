import API from './axios';

export const getPurchases = () => API.get('/purchases');
export const getPurchaseById = (id) => API.get(`/purchases/${id}`);
export const createPurchase = (data) => API.post('/purchases', data);