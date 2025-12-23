import apiClient from "./apiClient";

export const aiSolve = (payload) =>
    apiClient.post("/ai/solve", payload);

export const aiSummarize = (payload) =>
    apiClient.post("/ai/summarize", payload);

export const aiHint = (payload) =>
    apiClient.post("/ai/hint", payload);

export const aiFeedback = (payload) =>
    apiClient.post("/ai/feedback", payload);

export const aiChat = (payload) =>
    apiClient.post("/ai/chat", payload);
