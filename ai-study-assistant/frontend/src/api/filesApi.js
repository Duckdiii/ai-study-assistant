import apiClient from "./apiClient";

//Gửi nhiều file lên backend và gắn vào một problem:
export const uploadProblemFiles = (problemId, fileList) => {
    const form = new FormData(); //FormData là kiểu dữ liệu đặc biệt của browser => dùng để gửi file
    for (const f of fileList) { //fileList là gồm các file user upload
        form.append("files", f) //append("key", value)
    };

    return apiClient.post(`/problems/${problemId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" }, //đang gửi form + file
    });
};

export const getFileMeta = (fileId) => apiClient.get(`/files/${fileId}`);

//Blob = dữ liệu nhị phân (binary), dùng cho file: ảnh, pdf, doc, zip, …
export const downloadFile = (fileId) => apiClient.get(`/files/download/${fileId}`, { responseType: "blob" });
