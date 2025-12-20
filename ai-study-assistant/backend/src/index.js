import http from "http";
import path from "path";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";

import prisma from "./config/prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import fileRoutes from "./routes/file.routes.js";
import router from "./routes/index.js";
import problemRoutes from "./routes/problem.routes.js";

dotenv.config();

const app = express(); //khởi tạo server Express

app.use(cors()); //xem note.txt
app.use(express.json()); // đọc được dữ liêu dạng JSON trong body mà phía Client gửi lên
const __dirname = process.cwd(); //Lấy thư mục gốc hiện tại của project
app.use("/static", express.static(path.join(__dirname, "uploads"))); //Cho phép truy cập file trong thư mục uploads qua URL /static

app.use(helmet()); //xem note.txt

// CORS for REST
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", //cho phép frontend truy cập
    credentials: true, //cho phép gửi cookie/authorization headers kèm request.
  })
);

app.use(requestLogger); //Ghi log mỗi request đến server

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/auth", authRoutes);

// Problem routes
app.use("/problems", problemRoutes);

// API routes
app.use("/api", router);

// File routes
app.use("/files", fileRoutes);
// Chat routes
app.use("/chat", chatRoutes);

// AI routes
app.use("/ai", aiRoutes);

// Analytics routes
app.use("/analytics", analyticsRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Create socket.io server
const io = new SocketIOServer(httpServer, { //REST API (Express) và WebSocket (Socket.IO) chạy chung một cổng.
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", //chỉ cho phép frontend ở URL này kết nối
    methods: ["GET", "POST"],
    credentials: true, //cho phép gửi thông tin xác thực (cookie/auth
  },
});

app.set("io", io); //gắn io vào app để dùng ở nơi khác.

// Socket.io auth middleware
const JWT_SECRET = process.env.JWT_SECRET;

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token || // token mà client gửi lên khi bắt đầu kết nối socket.
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    const payload = jwt.verify(token, JWT_SECRET); //kiểm tra chữ ký và lấy payload.

    socket.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Invalid token"));
  }
});

// Socket.io connections
io.on("connection", (socket) => { //Chạy khi có client kết nối socket thành công.
  console.log("Socket connected:", socket.id, "user:", socket.user);
  socket.join(`user:${socket.user.id}`); //Mỗi user vào room riêng của mình (để gửi tin riêng)
  if (socket.user?.role) { //Vào room theo role
    socket.join(`role:${socket.user.role}`);
  }

  // Join room
  socket.on("chat:joinRoom", (roomId) => { //Client gửi roomId → server cho socket vào phòng đó.
    console.log(`User ${socket.user.id} join room ${roomId}`);
    socket.join(roomId);
  });

  // Receive message from client
  socket.on("chat:message", async ({ roomId, content }) => {
    if (!roomId || !content) return;

    try {
      //Save to DB
      const msg = await prisma.chatMessage.create({ //Lưu message vào DB
        data: {
          roomId,
          content,
          senderId: socket.user.id,
        },
        include: {
          sender: true,
        },
      });
      //Sau đó broadcast message mới cho mọi client trong room
      io.to(roomId).emit("chat:message", {
        id: msg.id,
        roomId: msg.roomId,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        createdAt: msg.createdAt,
      });
    } catch (err) {
      console.error("chat:message error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id); //Log khi client rời socket
  });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`HTTP + WebSocket server listening on http://localhost:${PORT}`);
});
