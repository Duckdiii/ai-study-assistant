import { io } from "socket.io-client";

export function createSocket(accessToken) {
    return io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
        //Polling: cứ vài giây gửi request hỏi “có tin mới không?” (chậm hơn).
        //WebSocket: mở kết nối liên tục, server có tin mới là đẩy luôn về client (nhanh hơn).
        transports: ["websocket"], //chỉ dùng WebSocket 
        auth: { token: accessToken }, //  gửi token kèm khi kết nối để backend xác thực
    });
}