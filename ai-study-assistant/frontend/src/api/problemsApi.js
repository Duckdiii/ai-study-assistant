import apiClient from "./apiClient";

// problems
export const getProblems = (params) => apiClient.get("/problems", { params });
export const createProblem = (data) => apiClient.post("/problems", data);
export const getProblemById = (id) => apiClient.get(`/problems/${id}`);
export const updateProblem = (id, data) => apiClient.patch(`/problems/${id}`, data);

// notes (nếu backend bạn có routes này; nếu chưa có thì bạn comment lại)
export const getNotes = (problemId) => apiClient.get(`/problems/${problemId}/notes`);
export const addNote = (problemId, content) =>
    apiClient.post(`/problems/${problemId}/notes`, { content });

// AI
export const aiSolve = (payload) => apiClient.post("/ai/solve", payload);
export const summarize = (payload) => apiClient.post("/ai/summarize", payload);

// analytics
export const analyticsMe = () => apiClient.get("/analytics/me");
export const analyticsOverview = () => apiClient.get("/analytics/overview");

// files
export const uploadProblemFiles = (problemId, filelist) => {
    const form = new FormData();
    for (const f of filelist) form.append("files", f); // field phải đúng = "files" (multer upload.array("files",...))
    return apiClient.post(`/problems/${problemId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const downloadFile = (fileId) =>
    apiClient.get(`/files/download/${fileId}`, { responseType: "blob" });

export const getFileMeta = (fileId) => apiClient.get(`/files/${fileId}`);
