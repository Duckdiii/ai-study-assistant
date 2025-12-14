import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js"; // nếu bạn có file riêng
import {
    getOverviewAnalyticsHandler,
    getMyAnalyticsHandler,
} from "../controllers/analytics.controller.js";

const router = Router();

// tất cả analytics đều yêu cầu login
router.use(authMiddleware);

// Admin overview
router.get(
    "/overview",
    requireRole("ADMIN"), // chỉ admin
    getOverviewAnalyticsHandler
);

// Thống kê riêng của user hiện tại
router.get("/me", getMyAnalyticsHandler);

export default router;
