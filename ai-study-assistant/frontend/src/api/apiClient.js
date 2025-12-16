import axios from "axios";

// Nếu bạn có .env của Vite: VITE_API_URL=http://localhost:4000
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

const TOKEN_KEY = "accessToken";

// Request interceptor: tự gắn Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: log lỗi + optional auto logout nếu 401
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message || err?.message || "Unknown API error";
    console.error("API Error:", msg);

    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("authUser");
      // nếu muốn auto về login:
      // window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default apiClient;
