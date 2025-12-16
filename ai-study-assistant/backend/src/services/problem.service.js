import prisma from "../config/prisma.js";

// Tạo problem mới
export async function createProblem(userId, data) {
    const { title, content, subject, difficulty } = data;

    if (!title || !content || !subject) {
        throw new Error("MISSING_FIELDS");
    }

    const problem = await prisma.problem.create({
        data: {
            title,
            content,
            subject,
            difficulty, // "EASY" | "MEDIUM" | "HARD" (nếu bạn dùng enum)
            ownerId: userId,
        },
    });

    return problem;
}

// List problems + search/filter/pagination
export async function listProblems(user, query) {
    const {
        q,
        subject,
        difficulty,
        status,
        page = 1,
        pageSize = 10,
        sort = "createdAt",
        order = "desc",
    } = query;

    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 10;

    const where = {};

    // Nếu KHÔNG phải admin → chỉ thấy bài của chính mình
    if (user.role !== "ADMIN") {
        where.ownerId = user.id;
    }

    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
        ];
    }

    if (subject) {
        where.subject = { contains: subject, mode: "insensitive" };
    }

    if (difficulty) {
        where.difficulty = difficulty;
    }

    if (status) {
        where.status = status;
    }

    function parseSort(sort) {
        // sort ví dụ: "createdAt:desc" hoặc "title:asc"
        if (!sort) return { createdAt: "desc" };

        const [field, dir] = String(sort).split(":");

        // whitelist field để tránh lỗi + tránh user truyền bậy
        const safeField = ["createdAt", "title", "status", "subject"].includes(field)
            ? field
            : "createdAt";

        const safeDir = dir === "asc" ? "asc" : "desc";

        return { [safeField]: safeDir };
    }
    const orderBy = parseSort(sort);
    const [items, total] = await Promise.all([
        prisma.problem.findMany({
            where,
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
            orderBy
        }),
        prisma.problem.count({ where }),
    ]);

    return {
        items,
        total,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
    };
}

// Lấy 1 problem (kèm kiểm tra quyền)
export async function getProblemById(id, user) {
    const problem = await prisma.problem.findUnique({
        where: { id: Number(id) },
    });

    if (!problem) return null;

    if (user.role !== "ADMIN" && problem.ownerId !== user.id) {
        throw new Error("FORBIDDEN");
    }

    return problem;
}

// Update problem
export async function updateProblem(id, user, data) {
    const problem = await prisma.problem.findUnique({
        where: { id: Number(id) },
    });

    if (!problem) return null;
    if (user.role !== "ADMIN" && problem.ownerId !== user.id) {
        throw new Error("FORBIDDEN");
    }

    const updated = await prisma.problem.update({
        where: { id: Number(id) },
        data, // có thể update title/content/status/difficulty...
    });

    return updated;
}

// Delete problem
export async function deleteProblem(id, user) {
    const problem = await prisma.problem.findUnique({
        where: { id: Number(id) },
    });

    if (!problem) return null;
    if (user.role !== "ADMIN" && problem.ownerId !== user.id) {
        throw new Error("FORBIDDEN");
    }

    await prisma.problem.delete({ where: { id: Number(id) } });
    return true;
}
