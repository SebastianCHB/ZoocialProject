import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

// endpoint — app.config.js provides the real value at runtime
export const API_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:8000/api';

// instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// interceptor
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
