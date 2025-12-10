import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: add auth, problems, notes, files, ai, and socket.io event bindings

export default router;
