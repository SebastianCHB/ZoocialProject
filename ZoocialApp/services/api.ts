import axios from 'axios';
import { storage } from '../utils/storage';

// We'll point this to the typical Android emulator localhost IP for Laravel, or a network IP.
// 10.0.2.2 is used for Android emulator to access the host machine's localhost.
// Consider using your actual local IP (e.g., 192.168.1.X) if testing on a physical device via Expo Go.
export const API_URL = 'http://192.168.1.40:8000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
