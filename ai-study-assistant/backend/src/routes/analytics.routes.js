import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js"; // nếu bạn có file riêng
import {
    getOverviewAnalyticsHandler,
    getMyAnalyticsHandler,
} from "../controllers/analytics.controller.js";

const router = Router();

router.use(authMiddleware);//Mọi route bên dưới bắt buộc đăng nhập

// Admin overview
router.get(
    "/overview",
    requireRole("ADMIN"), // chỉ admin
    getOverviewAnalyticsHandler
);

// Thống kê riêng của user hiện tại
router.get("/me", getMyAnalyticsHandler);

export default router;
