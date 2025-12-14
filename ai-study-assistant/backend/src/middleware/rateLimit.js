import rateLimit from "express-rate-limit";

// Giới hạn cho login: tối đa 10 request / 15 phút / IP
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10,
    message: {
        message: "Too many login attempts, please try again later.",
    },
});

// Giới hạn cho AI: tối đa 50 request / 15 phút / IP
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: {
        message: "Too many AI requests, please slow down.",
    },
});
