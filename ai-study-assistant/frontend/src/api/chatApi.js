import apiClient from "./apiClient";

export const getChatHistory = ({ roomId, page, pageSize }) =>
  apiClient.get("/chat/history", { params: { roomId, page, pageSize } });
