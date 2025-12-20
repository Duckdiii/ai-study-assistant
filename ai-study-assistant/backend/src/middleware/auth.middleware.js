import jwt from "jsonwebtoken";
import { loginLimiter } from "../middleware/rateLimit.js";
import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const JWT_SECRET = process.env.JWT_SECRET;
const router = Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization; //Lấy header Authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1]; //Tách token: Bearer <token>

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // Gắn user info vào req để dùng ở controller
        req.user = {
            id: payload.userId,
            role: payload.role,
        };

        next();
    } catch (err) {
        console.error("JWT error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden: insufficient role" });
        }
        next();
    };
}
