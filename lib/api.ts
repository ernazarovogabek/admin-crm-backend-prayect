import axios from "axios";

// Next.js API route orqali
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 30000,
});

// Request interceptor - har bir requestga token qo'shish
api.interceptors.request.use(
  (config) => {
    // localStorage dan token olish
    let token = localStorage.getItem("token");

    // Agar localStorage'da yo'q bo'lsa, cookie'dan olish
    if (!token && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("API Request:", config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401/403 xatoliklarni handle qilish
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    // 404 xatoliklarni console'ga chiqarmaslik (endpoint mavjud emas)
    if (error.response?.status !== 404) {
      console.error("API Error:", error.config?.url, error.response?.status);
    }
    if (error.response?.status === 401 || error.response?.status === 403) {
      // localStorage va cookie'dan tokenni o'chirish
      localStorage.removeItem("token");
      if (typeof document !== 'undefined') {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
