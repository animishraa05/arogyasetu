<<<<<<< HEAD
import axios from "axios";
import API_BASE_URL from "./apiConfig";
=======
import axios from 'axios';
import { getAccessToken, clearAuth } from "./api/authConfig";
import API_BASE_URL from './apiConfig';

>>>>>>> 790c6c84aa5fdceff28cce8837fa2d695b3d6479

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

<<<<<<< HEAD
// Use an interceptor to add the token to every request
instance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('access_token');

    // If the token exists, add the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

=======
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
>>>>>>> 790c6c84aa5fdceff28cce8837fa2d695b3d6479
export default instance;
