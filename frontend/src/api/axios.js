import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL; // set in Vercel

const API = axios.create({
  baseURL: baseURL,  // example: https://quiz-11-2fr7.onrender.com/api
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
