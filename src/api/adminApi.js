import API from './axiosInstance';

// Auth
export const login = (email, password) => API.post('/auth/login', { email, password });
export const logout = () => API.get('/auth/logout');
export const getProfile = () => API.get('/auth/profile');
export const changePassword = (data) => API.post('/auth/change-password', data);
export const editProfile = (data) => API.post('/auth/edit-profile', data);

// Dashboard
export const getDashboard = () => API.get('/dashboard');
