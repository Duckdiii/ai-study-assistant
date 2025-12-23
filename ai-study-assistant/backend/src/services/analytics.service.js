import prisma from "../config/prisma.js";

// Thời điểm 7 ngày trước
function sevenDaysAgo() {
    const d = new Date(); // hiện tại
    d.setDate(d.getDate() - 7); // lùi 7 ngày
    return d;
}

function formatDateKey(d) { //
    return d.toISOString().slice(0, 10); // 2025-01-03T12:34:56.789Z -> 2025-01-03
}

function getLastNDays(n) {//tạo danh sách n ngày gần nhất (tính cả hôm nay) -> trục thời gian cho chart
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = n - 1; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    return days;
}

//overview cho admin
export async function getOverviewAnalytics() {
    // total problems
    const totalProblems = await prisma.problem.count();

    // solved vs pending
    const solvedCount = await prisma.problem.count({
        where: { status: "SOLVED" },
    });
    const pendingCount = await prisma.problem.count({
        where: { status: "PENDING" },
    });

    // problems by subject
    const problemsBySubjectRaw = await prisma.problem.groupBy({
        by: ["subject"],
        _count: { _all: true },
    });

    const problemsBySubject = problemsBySubjectRaw.map((row) => ({
        subject: row.subject,
        count: row._count._all,
    }));

    const problemsByStatus = [
        { status: "SOLVED", count: solvedCount },
        { status: "PENDING", count: pendingCount },
    ];

    // AI calls in last 7 days
    const aiStart = new Date();
    aiStart.setDate(aiStart.getDate() - 6);
    aiStart.setHours(0, 0, 0, 0);

    const aiRows = await prisma.aiInteraction.findMany({
        where: {
            createdAt: {
                gte: aiStart,
            },
        },
        select: { createdAt: true },
    });

    const aiCallsLast7Days = aiRows.length;
    const dayKeys = getLastNDays(7).map(formatDateKey);

    const aiCounts = new Map(dayKeys.map((key) => [key, 0])); // tạo một Map để đếm số lần gọi AI

    aiRows.forEach((row) => {
        const key = formatDateKey(row.createdAt);
        if (aiCounts.has(key)) {
            aiCounts.set(key, aiCounts.get(key) + 1);
        }
    });

    const aiCallsByDay = dayKeys.map((key) => ({
        date: key,// ngày
        count: aiCounts.get(key) || 0, // lấy số lần gọi AI của ngày đó
    }));

    return {
        totalProblems,
        solvedCount,
        pendingCount,
        problemsByStatus,
        problemsBySubject,
        aiCallsLast7Days,
        aiCallsByDay,
    };
}

//user
export async function getUserAnalytics(userId) {
    //Tổng số problem của user
    const totalProblems = await prisma.problem.count({
        where: { ownerId: userId },
    });

    // SOLVED vs PENDING
    const solvedCount = await prisma.problem.count({
        where: { ownerId: userId, status: "SOLVED" },
    });
    const pendingCount = await prisma.problem.count({
        where: { ownerId: userId, status: "PENDING" },
    });

    //Problem theo subject của user
    const problemsBySubjectRaw = await prisma.problem.groupBy({
        by: ["subject"],
        where: { ownerId: userId },
        _count: { _all: true },
    });

    const problemsBySubject = problemsBySubjectRaw.map((row) => ({
        subject: row.subject,
        count: row._count._all,
    }));

    //Số lần gọi AI 7 ngày gần nhất của user
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
