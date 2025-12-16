import apiClient from "./apiClient";

export const register = (data) => apiClient.post("/auth/register", data);
export const login = (data) => apiClient.post("/auth/login", data);

// Google OAuth start: backend sẽ redirect sang Google
export const startGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/auth/google`;
};
