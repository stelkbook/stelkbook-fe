import axios from 'axios';

const fallbackBaseURL = 'http://127.0.0.1:8000/api';
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
    : undefined) ||
  fallbackBaseURL;

const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message;
    console.error(`[API ERROR] ${status || 'network'}: ${message}`);
    return Promise.reject(error);
  }
);

export default api;
