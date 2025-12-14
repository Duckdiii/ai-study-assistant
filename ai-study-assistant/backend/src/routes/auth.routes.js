import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import {
    googleAuthStart,
    googleAuthCallback,
} from "../controllers/google-auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Google OAuth2
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

export default router;
