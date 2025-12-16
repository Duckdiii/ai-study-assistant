import { Router } from "express";

const router = Router();

// Mock data in-memory
let problems = [
  { id: "p1", title: "Bài 1", subject: "Math", content: "", createdAt: new Date().toISOString() },
  { id: "p2", title: "Bài 2", subject: "IT", content: "", createdAt: new Date().toISOString() },
];

// GET /api/problems?search=&page=&limit=
router.get("/", (req, res) => {
  const search = String(req.query.search ?? "").toLowerCase();
  const page = Math.max(parseInt(req.query.page ?? "1", 10), 1); // Không cho page < 1
  const limit = Math.min(Math.max(parseInt(req.query.limit ?? "10", 10), 1), 50); //Mặc định: 10 + tối đa 50 + 

  let filtered = problems;
  if (search) {
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(search));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  res.json({ items, total, page, limit });
});

// POST /api/problems
router.post("/", (req, res) => {
  const { title, subject = "General", content = "" } = req.body;

  if (!title || !String(title).trim()) {
    return res.status(400).json({ message: "title is required" });
  }

  const newProblem = {
    id: `p_${Date.now()}`,
    title: String(title).trim(),
    subject,
    content,
    createdAt: new Date().toISOString(),
  };

  problems.unshift(newProblem);
  res.status(201).json(newProblem);
});

// GET /api/problems/:id
router.get("/:id", (req, res) => {
  const p = problems.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

export default router;
