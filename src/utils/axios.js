import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : undefined);

if (!baseURL && typeof window !== 'undefined') {
  console.error('API URL is not defined. Please check NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BACKEND_URL environment variables.');
}

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Accept': 'application/json',
    }
    // baseURL:"http://192.168.91.145:8080/api"
})
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
})

export default api;