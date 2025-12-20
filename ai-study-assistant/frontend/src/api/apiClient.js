import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const apiClient = axios.create({
  baseURL,
  withCredentials: false,
});

const TOKEN_KEY = "accessToken";

//Nó chạy trước mỗi request đi ra -> tự động gắn token vào mọi request
apiClient.interceptors.request.use((config) => {
  //Trước mỗi request, lấy token từ localStorag
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Nó chạy sau khi nhận response từ server
apiClient.interceptors.response.use(
  (res) => res, //response thành công (status 2xx) 
  (err) => { //có lỗi (4xx/5xx)
    const msg = // message lỗi từ response hoặc message chung
      err?.response?.data?.message || err?.message || "Unknown API error";
    console.error("API Error:", msg);

    if (err?.response?.status === 401) { //unauthorized
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default apiClient;
