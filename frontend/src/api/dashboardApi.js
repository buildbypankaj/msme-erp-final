import API from './axios';

export const getDashboardSummary = () => API.get('/dashboard/summary');