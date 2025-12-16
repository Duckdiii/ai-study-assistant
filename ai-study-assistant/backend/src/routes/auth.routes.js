import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import {
    googleAuthStart,
    googleAuthCallback,
} from "../controllers/google-auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { authMeHandler } from "../controllers/auth.controller.js";
const router = Router();

router.get("/me", authMiddleware, authMeHandler);

router.post("/register", register);
router.post("/login", login);

// Google OAuth2
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

export default router;
