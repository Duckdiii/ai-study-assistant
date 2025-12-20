import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
    listUsersHandler,
    updateUserRoleHandler,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authMiddleware); //Mọi route bên dưới bắt buộc đăng nhập
router.use(requireRole("ADMIN")); //Mọi route bên dưới chỉ cho ADMIN truy cập

router.get("/users", listUsersHandler); // lấy danh sách user
router.patch("/users/:id/role", updateUserRoleHandler);

export default router;
