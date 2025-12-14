import prisma from "../config/prisma.js";

// Thời điểm 7 ngày trước
function sevenDaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
}

// ===== OVERVIEW (cho admin) =====
export async function getOverviewAnalytics() {
    // 1. Tổng số problem
    const totalProblems = await prisma.problem.count();

    // 2. Số problem solved vs pending
    const solvedCount = await prisma.problem.count({
        where: { status: "SOLVED" },
    });
    const pendingCount = await prisma.problem.count({
        where: { status: "PENDING" },
    });

    // 3. Số problem theo subject
    const problemsBySubjectRaw = await prisma.problem.groupBy({
        by: ["subject"],
        _count: { _all: true },
    });

    const problemsBySubject = problemsBySubjectRaw.map((row) => ({
        subject: row.subject,
        count: row._count._all,
    }));

    // 4. Số lần gọi AI trong 7 ngày gần nhất
    const aiCallsLast7Days = await prisma.aiInteraction.count({
        where: {
            createdAt: {
                gte: sevenDaysAgo(),
            },
        },
    });

    return {
        totalProblems,
        solvedCount,
        pendingCount,
        problemsBySubject,
        aiCallsLast7Days,
    };
}

// ===== THỐNG KÊ RIÊNG CHO USER =====
export async function getUserAnalytics(userId) {
    // 1. Tổng số problem của user
    const totalProblems = await prisma.problem.count({
        where: { ownerId: userId },
    });

    // 2. SOLVED vs PENDING
    const solvedCount = await prisma.problem.count({
        where: { ownerId: userId, status: "SOLVED" },
    });
    const pendingCount = await prisma.problem.count({
        where: { ownerId: userId, status: "PENDING" },
    });

    // 3. Problem theo subject của user
    const problemsBySubjectRaw = await prisma.problem.groupBy({
        by: ["subject"],
        where: { ownerId: userId },
        _count: { _all: true },
    });

    const problemsBySubject = problemsBySubjectRaw.map((row) => ({
        subject: row.subject,
        count: row._count._all,
    }));

    // 4. Số lần gọi AI 7 ngày gần nhất của user
    const aiCallsLast7Days = await prisma.aiInteraction.count({
        where: {
            userId,
            createdAt: {
                gte: sevenDaysAgo(),
            },
        },
    });

    return {
        totalProblems,
        solvedCount,
        pendingCount,
        problemsBySubject,
        aiCallsLast7Days,
    };
}
