import axios from 'axios';
import { getAccessToken, clearAuth } from "./api/authConfig";
import API_BASE_URL from './apiConfig';


const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Request Interceptor → har request pe token add karega
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor → agar unauthorized mila to logout
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = "/"; // tumhare login page ka path
    }
    return Promise.reject(error);
  }
);
export default instance;