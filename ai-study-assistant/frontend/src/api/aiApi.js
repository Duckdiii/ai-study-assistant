import apiClient from "./apiClient";

export const aiSolve = ({ problemId, text }) =>
    apiClient.post("/ai/solve", { problemId, text });

export const aiSummarize = ({ text }) =>
    apiClient.post("/ai/summarize", { text });