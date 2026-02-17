import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000", // Yoki ishlatiladigan URL
  headers: {
    "Content-Type": "application/json",
  },
});

// So'rovlar oldin tokenni qo'shish
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;