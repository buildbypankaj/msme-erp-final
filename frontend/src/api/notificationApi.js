import API from './axios';

export const getNotifications = () => API.get('/notifications');
