import API from './axios';

export const globalSearch = (query) => API.get('/search', { params: { q: query } });