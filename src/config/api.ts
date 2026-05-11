import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const BASE_URL = 'http://4.224.186.213/evaluation-service';

export const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  AUTH: `${BASE_URL}/auth`,
  LOGS: `${BASE_URL}/logs`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  DEPOTS: `${BASE_URL}/depots`,
  VEHICLES: `${BASE_URL}/vehicles`,
};

const api = axios.create({
  timeout: 10000,
});

// Interceptor to add Bearer token to protected routes
api.interceptors.request.use(
  (config) => {
    const token = process.env.ACCESS_TOKEN;
    if (token && config.url !== ENDPOINTS.REGISTER && config.url !== ENDPOINTS.AUTH) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
