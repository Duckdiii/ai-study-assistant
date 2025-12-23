import {
    solveProblem,
    summarizeText,
    getHint,
    getFeedback,
    chatWithContext,
} from "../services/ai.service.js";

export async function solveProblemHandler(req, res) {
    try {
        const io = req.app.get("io");
        const userId = req.user.id;
        const { problemId, text, llmProvider, llmModel } = req.body;

        const { answer, logId } = await solveProblem({
            userId,
            problemId,
            text,
            llmProvider,
            llmModel,
        });

        if (io) {
            io.to(`user:${req.user.id}`).emit("notification:aiDone", {
                problemId,
                preview: answer.slice(0, 80),
            });
        }

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
        const { text, llmProvider, llmModel } = req.body;

        const { answer, logId } = await summarizeText({
            userId,
            text,
            llmProvider,
            llmModel,
        });

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

export async function hintHandler(req, res) {
    try {
        const userId = req.user.id;
        const { problemId, text, llmProvider, llmModel } = req.body;

        const { answer, logId } = await getHint({
            userId,
            problemId,
            text,
            llmProvider,
            llmModel,
        });

        res.json({
            message: "AI hint generated",
            answer,
            logId,
        });
    } catch (err) {
        console.error("hint error:", err);
        if (err.message === "PROBLEM_NOT_FOUND") {
            return res.status(404).json({ message: "Problem not found" });
        }
        if (err.message === "NO_TEXT") {
            return res.status(400).json({ message: "Either problemId or text is required" });
        }
        res.status(500).json({ message: "AI service error" });
    }
}

export async function feedbackHandler(req, res) {
    try {
        const userId = req.user.id;
        const { problemId, answerText, llmProvider, llmModel } = req.body;

        const { answer, logId } = await getFeedback({
            userId,
            problemId,
            answerText,
            llmProvider,
            llmModel,
        });

        res.json({
            message: "AI feedback generated",
            answer,
            logId,
        });
    } catch (err) {
        console.error("feedback error:", err);
        if (err.message === "PROBLEM_NOT_FOUND") {
            return res.status(404).json({ message: "Problem not found" });
        }
        if (err.message === "NO_ANSWER") {
            return res.status(400).json({ message: "Answer text is required" });
        }
        res.status(500).json({ message: "AI service error" });
    }
}

export async function chatHandler(req, res) {
    try {
        const userId = req.user.id;
        const { problemId, message, history, llmProvider, llmModel } = req.body;

        const { answer, logId } = await chatWithContext({
            userId,
            problemId,
            message,
            history,
            llmProvider,
            llmModel,
        });

        res.json({
            message: "AI chat response generated",
            answer,
            logId,
        });
    } catch (err) {
        console.error("chat error:", err);
        if (err.message === "PROBLEM_NOT_FOUND") {
            return res.status(404).json({ message: "Problem not found" });
        }
        if (err.message === "NO_TEXT") {
            return res.status(400).json({ message: "Message is required" });
        }
        res.status(500).json({ message: "AI service error" });
    }
}
