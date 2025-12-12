import apiClient from "./apiClient";

export const getProblems = (params) => apiClient.get("/problems", { params });
export const createProblem = (data) => apiClient.post("/problems", data);
export const getProblemById = (id) => apiClient.get(`/problems/${id}`);
