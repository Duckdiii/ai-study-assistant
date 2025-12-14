import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getChatHistoryHandler } from "../controllers/chat.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/history", getChatHistoryHandler);

export default router;
