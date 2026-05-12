import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
    baseURL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    withCredentials: false
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// AUTO_LOGOUT_ON_401 - Si el servidor retorna 401, el token expiró: limpiar sesión
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.hash = '#/login';
        }
        return Promise.reject(err);
    }
);

export default api;
