import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import router from "./routes/index.js";
import problemRoutes from "./routes/problem.routes.js";
import fileRoutes from "./routes/file.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./config/prisma.js";

import helmet from "helmet";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const __dirname = process.cwd();
app.use("/static", express.static(path.join(__dirname, "uploads")));

app.use(helmet()); // Security headers

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

//Tiện ích
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

// Tạo HTTP server từ Express app
const httpServer = http.createServer(app);

// Tạo socket.io server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware xác thực cho socket.io
const JWT_SECRET = process.env.JWT_SECRET;

io.use((socket, next) => {
  try {
    // Client có thể gửi token qua:
    // - socket.handshake.auth.token
    // - hoặc query: ?token=...
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    const payload = jwt.verify(token, JWT_SECRET);

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
// Xử lý kết nối socket.io
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id, "user:", socket.user);

  // Join room
  socket.on("chat:joinRoom", (roomId) => {
    console.log(`User ${socket.user.id} join room ${roomId}`);
    socket.join(roomId);
  });

  // Nhận message từ client
  socket.on("chat:message", async ({ roomId, content }) => {
    if (!roomId || !content) return;

    try {
      // 1. Lưu vào DB
      const msg = await prisma.chatMessage.create({
        data: {
          roomId,
          content,
          senderId: socket.user.id,
        },
        include: {
          sender: true,
        },
      });

      // 2. Gửi lại cho tất cả client trong room
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
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Chat routes
app.use("/chat", chatRoutes);

// AI routes
app.use("/ai", aiRoutes);

// Analytics routes
app.use("/analytics", analyticsRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 4000;
//app.listen(PORT, () => {
//  console.log(`Server listening on http://localhost:${PORT}`);
//});
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP + WebSocket server listening on http://localhost:${PORT}`);
});