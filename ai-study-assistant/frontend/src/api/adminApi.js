import apiClient from "./apiClient";

export const getUsers = () => apiClient.get("/admin/users"); //Lấy danh sách tất cả user
export const updateUserRole = (userId, role) => //Cập nhật role/quyền của user
  apiClient.patch(`/admin/users/${userId}/role`, { role });
