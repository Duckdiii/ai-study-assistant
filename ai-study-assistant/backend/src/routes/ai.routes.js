import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    solveProblemHandler,
    summarizeHandler,
} from "../controllers/ai.controller.js";
import { aiLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(authMiddleware); //Mọi route bên dưới bắt buộc đăng nhập

router.post("/solve", solveProblemHandler);
router.post("/summarize", summarizeHandler);

export default router;
