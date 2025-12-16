import apiClient from "./apiClient";
//Gửi file mà user chọn (ảnh, pdf, doc, …) lên backend
//Gắn file đó vào 1 Problem cụ thể
export const uploadProblemFiles = (problemId, fileList) => {
    const form = new FormData(); //FormData là kiểu dữ liệu đặc biệt của browser => dùng để gửi file
    for (const f of fileList) { //fileList là gồm các file user upload
        form.append("files", f)
    };

    return apiClient.post(`/problems/${problemId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" }, //Tôi không gửi JSON, tôi đang gửi form + file
    });
};

export const getFileMeta = (fileId) => apiClient.get(`/files/${fileId}`);

//Blob = dữ liệu nhị phân (binary), dùng cho file: ảnh, pdf, doc, zip, …
export const downloadFile = (fileId) => apiClient.get(`/files/download/${fileId}`, { responseType: "blob" });
