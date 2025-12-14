import prisma from "../config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-1.5-flash"; // hoặc model khác nếu bạn muốn

// Hàm call Gemini chung
async function callGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

// Giải bài tập (bằng problemId trong DB hoặc text trực tiếp)
export async function solveProblem({ userId, problemId, text }) {
    let problemText = text;

    // Nếu có problemId -> lấy nội dung từ DB
    if (problemId) {
        const problem = await prisma.problem.findUnique({
            where: { id: Number(problemId) },
        });
        if (!problem) {
            throw new Error("PROBLEM_NOT_FOUND");
        }
        problemText = `${problem.title}\n\n${problem.content}`;
    }

    if (!problemText) {
        throw new Error("NO_TEXT");
    }

    const prompt = `
You are an AI study assistant. Solve the following problem step by step, explain clearly.

Problem:
${problemText}
`;

    const answer = await callGemini(prompt);

    // Lưu log vào DB
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
