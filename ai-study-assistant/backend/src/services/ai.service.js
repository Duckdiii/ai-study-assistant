import prisma from "../config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = "gemini-2.5-flash";

// Hàm call Gemini chung
async function callGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: modelName }); //Lấy model Gemini

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// Giải bài tập (bằng problemId trong DB hoặc text trực tiếp)
export async function solveProblem({ userId, problemId, text }) {
    const userPrompt = text?.trim();
    let problemContext = ""; //thông tin bối cảnh của problem (title, content, notes…)

    if (problemId) {
        const problem = await prisma.problem.findUnique({ where: { id: Number(problemId) } }); //tìm problem theo id trong DB
        if (!problem) throw new Error("PROBLEM_NOT_FOUND");
        problemContext = `${problem.title}\n\n${problem.content}`; //lấy title + content làm bối cảnh
    }

    if (!userPrompt && !problemContext) throw new Error("NO_TEXT");

    const prompt = `
You are an AI study assistant. If a user request is given, answer it directly; use the problem context only as background.

Problem context:
${problemContext || "(none)"}

User request:
${userPrompt || "Solve the problem context step by step, explain clearly."}
`;

    const answer = await callGemini(prompt);
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

// Tóm tắt 1 đoạn text
export async function summarizeText({ userId, text }) {
    if (!text) {
        throw new Error("NO_TEXT");
    }

    const prompt = `
You are an AI assistant. Summarize the following text in Vietnamese, concise but clear:

Text:
${text}
`;

    const answer = await callGemini(prompt);

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
