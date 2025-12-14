import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getFileHandler, downloadFileHandler } from "../controllers/file.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/:id", getFileHandler);           // GET /files/:id
router.get("/download/:id", downloadFileHandler); // GET /files/download/:id

export default router;
