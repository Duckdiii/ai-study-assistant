import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    createProblemHandler,
    listProblemsHandler,
    getProblemHandler,
    updateProblemHandler,
    deleteProblemHandler,
} from "../controllers/problem.controller.js";
import { upload } from "../config/multer.js";
import { uploadFilesHandler } from "../controllers/file.controller.js";
const router = Router();

// Tất cả route /problems đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get("/", listProblemsHandler);          // GET /problems
router.post("/", createProblemHandler);        // POST /problems
router.get("/:id", getProblemHandler);         // GET /problems/:id
router.put("/:id", updateProblemHandler);      // PUT /problems/:id
router.delete("/:id", deleteProblemHandler);   // DELETE /problems/:id
// Upload 1 hoặc nhiều file cho problem
router.post(
    "/:id/files",
    upload.array("files", 10),   // field name = "files", max 10 file
    uploadFilesHandler
);
export default router;
