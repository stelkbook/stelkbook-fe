import axios from 'axios';

const api =axios.create({
    baseURL:"http://127.0.0.1:8000/api",
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