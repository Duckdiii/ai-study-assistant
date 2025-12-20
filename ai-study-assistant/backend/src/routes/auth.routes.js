import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import {
    googleAuthStart,
    googleAuthCallback,
} from "../controllers/google-auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { authMeHandler } from "../controllers/auth.controller.js";
const router = Router();

router.get("/me", authMiddleware, authMeHandler); //cần đăng nhập (authMiddleware) 

router.post("/register", register);
router.post("/login", login);

// Google OAuth2
router.get("/google", googleAuthStart); //bắt đầu flow login Google
router.get("/google/callback", googleAuthCallback); //Google redirect về đây, backend xử lý callback

export default router;
