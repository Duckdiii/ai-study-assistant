import { solveProblem, summarizeText } from "../services/ai.service.js";

export async function solveProblemHandler(req, res) {
    try {
        const userId = req.user.id;
        const { problemId, text } = req.body;

        const { answer, logId } = await solveProblem({ userId, problemId, text });

        res.json({
            message: "AI solved problem successfully",
            answer,
            logId,
        });
    } catch (err) {
        console.error("solveProblem error:", err);
        if (err.message === "PROBLEM_NOT_FOUND") {
            return res.status(404).json({ message: "Problem not found" });
        }
        if (err.message === "NO_TEXT") {
            return res.status(400).json({ message: "Either problemId or text is required" });
        }
        res.status(500).json({ message: "AI service error" });
    }
}

export async function summarizeHandler(req, res) {
    try {
        const userId = req.user.id;
        const { text } = req.body;

        const { answer, logId } = await summarizeText({ userId, text });

        res.json({
            message: "AI summarized text successfully",
            answer,
            logId,
        });
    } catch (err) {
        console.error("summarize error:", err);
        if (err.message === "NO_TEXT") {
            return res.status(400).json({ message: "Text is required" });
        }
        res.status(500).json({ message: "AI service error" });
    }
}
