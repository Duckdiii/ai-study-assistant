import prisma from "../config/prisma.js";

export async function getChatHistory({ roomId, page = 1, pageSize = 20 }) {
    const pageNum = Number(page) || 1;
    const sizeNum = Number(pageSize) || 20;

    const [items, total] = await Promise.all([
        prisma.chatMessage.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" }, // lịch sử chat theo thời gian tăng dần
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
            include: {
                sender: true,
            },
        }),
        prisma.chatMessage.count({ where: { roomId } }),
    ]);

    return {
        items: items.map((m) => ({
            id: m.id,
            roomId: m.roomId,
            content: m.content,
            senderId: m.senderId,
            senderName: m.sender.name,
            createdAt: m.createdAt,
        })),
        total,
        page: pageNum,
        pageSize: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
    };
}
