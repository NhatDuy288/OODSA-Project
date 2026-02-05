import axios from "axios";
import { AuthService } from "../services/auth.service";
const url = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL: url,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;
