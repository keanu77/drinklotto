import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
});

// 添加 token 到請求 header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
