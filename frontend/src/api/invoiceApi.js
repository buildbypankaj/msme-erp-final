import API from './axios';

export const getInvoices = () => API.get('/invoices');
export const getInvoiceById = (id) => API.get(`/invoices/${id}`);
export const createInvoice = (data) => API.post('/invoices', data);