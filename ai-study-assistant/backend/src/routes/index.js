import { Router } from "express";
import problemsRouter from "./problems.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// /api/problems
router.use("/problems", problemsRouter);

export default router;
