import API from './axios';

export const getSalesReport = (startDate, endDate) =>
  API.get('/reports/sales', { params: { startDate, endDate } });

export const getPurchaseReport = (startDate, endDate) =>
  API.get('/reports/purchases', { params: { startDate, endDate } });

export const getLowStockReport = () => API.get('/reports/low-stock');

export const getPendingPaymentsReport = () => API.get('/reports/pending-payments');

export const getCustomerWiseSales = () => API.get('/reports/customer-wise');

export const getProductWiseSales = () => API.get('/reports/product-wise');