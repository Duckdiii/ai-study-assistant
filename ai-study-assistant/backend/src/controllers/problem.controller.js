import {
    createProblem,
    listProblems,
    getProblemById,
    updateProblem,
    deleteProblem,
} from "../services/problem.service.js";

export async function createProblemHandler(req, res) {
    try {
        const userId = req.user.id;
        const problem = await createProblem(userId, req.body);
        res.status(201).json({ message: "Problem created", problem });
    } catch (err) {
        console.error("createProblem error:", err);
        if (err.message === "MISSING_FIELDS") {
            return res.status(400).json({ message: "title, content, subject are required" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function listProblemsHandler(req, res) {
    try {
        const result = await listProblems(req.user, req.query);
        res.json(result);
    } catch (err) {
        console.error("listProblems error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getProblemHandler(req, res) {
    try {
        const problem = await getProblemById(req.params.id, req.user);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json(problem);
    } catch (err) {
        console.error("getProblem error:", err);
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateProblemHandler(req, res) {
    try {
        const updated = await updateProblem(req.params.id, req.user, req.body);
        if (!updated) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json({ message: "Problem updated", problem: updated });
    } catch (err) {
        console.error("updateProblem error:", err);
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteProblemHandler(req, res) {
    try {
        const ok = await deleteProblem(req.params.id, req.user);
        if (!ok) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json({ message: "Problem deleted" });
    } catch (err) {
        console.error("deleteProblem error:", err);
        if (err.message === "FORBIDDEN") {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
