import API from './axios';

export const getPayments = () => API.get('/payments');
export const createPayment = (data) => API.post('/payments', data);