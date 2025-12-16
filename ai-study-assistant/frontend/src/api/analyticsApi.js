import apiClient from "./apiClient";

export const analyticsMe = () => apiClient.get("/analytics/me");

export const analyticsOverview = () => apiClient.get("/analytics/overview");
