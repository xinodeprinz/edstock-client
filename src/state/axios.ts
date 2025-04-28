// src/lib/axios.ts
import axios from "axios";

const axiosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add token to every request
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosApi;
