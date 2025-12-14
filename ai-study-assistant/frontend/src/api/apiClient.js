import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Log gọn để debug
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Unknown API error";
    console.error("API Error:", msg);
    return Promise.reject(err);
  }
);

export default apiClient;
