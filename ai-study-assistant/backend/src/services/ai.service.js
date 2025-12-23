import prisma from "../config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const modelName = "gemini-2.5-flash";
const defaultOllamaModel = "qwen3:1.7b";

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY");
    }
    return new GoogleGenerativeAI(apiKey);
}


async function callGemini(prompt, modelOverride) {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: modelOverride || process.env.GEMINI_MODEL || modelName,
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function callOllama(prompt, modelOverride) {
    const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const model = modelOverride || process.env.OLLAMA_MODEL || defaultOllamaModel;

    const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt,
            stream: false,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OLLAMA_ERROR: ${text}`);
    }

    const data = await res.json();
    return data?.response || "";
}

async function callLLM(prompt, options = {}) {
    const provider = (options.provider || process.env.LLM_PROVIDER || "gemini").toLowerCase();
    const model = options.model;
    if (provider === "ollama") {
        return callOllama(prompt, model);
    }
    return callGemini(prompt, model);
}

async function buildProblemContext(problemId) { //tạo “ngữ cảnh bài toán”
    if (!problemId) return "";

    const problem = await prisma.problem.findUnique({
        where: { id: Number(problemId) },
        include: { notes: true },
    });

    if (!problem) throw new Error("PROBLEM_NOT_FOUND");

    const notesText = Array.isArray(problem.notes) && problem.notes.length
        ? "\nNotes:\n" + problem.notes.map((n, i) => `- (${i + 1}) ${n.content || ""}`).join("\n")
        : "";

    return `Title: ${problem.title}\nContent:\n${problem.content}${notesText}`;
}

function buildHistoryText(history) {
    if (!Array.isArray(history) || history.length === 0) return "";

    const rows = history.slice(-8).map((m) => { //lấy tối đa 8 tin nhắn gần nhất
        const role = m?.role === "assistant" ? "Assistant" : "User";
        const content = String(m?.content || "").trim();
        return content ? `${role}: ${content}` : "";
    }).filter(Boolean);
    return rows.join("\n");
}

export async function solveProblem({ userId, problemId, text, llmProvider, llmModel }) {
    const userPrompt = text?.trim();
    let problemContext = "";

    if (problemId) {
        problemContext = await buildProblemContext(problemId);
    }

    if (!userPrompt && !problemContext) throw new Error("NO_TEXT");

    const prompt = `
You are an AI study assistant. If a user request is given, answer it directly; use the problem context only as background.

Problem context:
${problemContext || "(none)"}

User request:
${userPrompt || "Solve the problem context step by step, explain clearly."}
`;

    const answer = await callLLM(prompt, { provider: llmProvider, model: llmModel });
    const log = await prisma.aiInteraction.create({
        data: {
            type: "SOLVE",
            prompt,
            response: answer,
            userId,
            problemId: problemId ? Number(problemId) : null,
        },
    });

    return { answer, logId: log.id };
}

export async function getHint({ userId, problemId, text, llmProvider, llmModel }) {
    const userPrompt = text?.trim();
    const problemContext = await buildProblemContext(problemId);

    if (!userPrompt && !problemContext) throw new Error("NO_TEXT");

    const prompt = `
You are an AI tutor. Provide a short hint without revealing the full solution.

Problem context:
${problemContext || "(none)"}

User question:
${userPrompt || "Give one helpful hint for the problem."}
`;

    const answer = await callLLM(prompt, { provider: llmProvider, model: llmModel });
    const log = await prisma.aiInteraction.create({
        data: {
            type: "HINT",
            prompt,
            response: answer,
            userId,
            problemId: problemId ? Number(problemId) : null,
        },
    });

    return { answer, logId: log.id };
}

export async function getFeedback({ userId, problemId, answerText, llmProvider, llmModel }) {
    const answer = answerText?.trim();
    if (!answer) throw new Error("NO_ANSWER");

    const problemContext = await buildProblemContext(problemId);

    const prompt = `
You are an AI instructor. Evaluate the student's answer and provide a score and feedback.
Return the result in this format:
Score: x/10
Feedback: ...

Problem context:
${problemContext || "(none)"}

Student answer:
${answer}
`;

    const response = await callLLM(prompt, { provider: llmProvider, model: llmModel });
    const log = await prisma.aiInteraction.create({
        data: {
            type: "FEEDBACK",
            prompt,
            response,
            userId,
            problemId: problemId ? Number(problemId) : null,
        },
    });

    return { answer: response, logId: log.id };
}

export async function chatWithContext({ userId, problemId, message, history, llmProvider, llmModel }) {
    const text = message?.trim();
    if (!text) throw new Error("NO_TEXT");

    const problemContext = await buildProblemContext(problemId);
    const historyText = buildHistoryText(history);

    const prompt = `
You are an AI study assistant. Answer clearly and concisely.

Problem context:
${problemContext || "(none)"}

Conversation history:
${historyText || "(none)"}

User: ${text}
Assistant:
`;

    const answer = await callLLM(prompt, { provider: llmProvider, model: llmModel });
    const log = await prisma.aiInteraction.create({
        data: {
            type: "CHAT",
            prompt,
            response: answer,
            userId,
            problemId: problemId ? Number(problemId) : null,
        },
    });

    return { answer, logId: log.id };
}

export async function summarizeText({ userId, text, llmProvider, llmModel }) {
    if (!text) {
        throw new Error("NO_TEXT");
    }

    const prompt = `
You are an AI assistant. Summarize the following text in Vietnamese, concise but clear:

Text:
${text}
`;

    const answer = await callLLM(prompt, { provider: llmProvider, model: llmModel });

    const log = await prisma.aiInteraction.create({
        data: {
            type: "SUMMARIZE",
            prompt,
            response: answer,
            userId,
        },
    });

    return { answer, logId: log.id };
}
