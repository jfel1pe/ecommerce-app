import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_BASE}/api`, // ajusta según cómo montaste rutas en backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir token automáticamente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;