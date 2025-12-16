import prisma from "../config/prisma.js";

export async function listNotesHandler(req, res, next) {
    try {
        const problemId = Number(req.params.id);

        const items = await prisma.note.findMany({
            where: { problemId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ items });
    } catch (e) {
        next(e);
    }
}

export async function addNoteHandler(req, res) {
    const problemId = Number(req.params.id);
    const { content } = req.body;
    const userId = req.user.id; // tùy middleware auth của bạn

    if (!content?.trim()) return res.status(400).json({ message: "Missing content" });

    const note = await prisma.note.create({
        data: {
            content: content.trim(),
            problemId,
            authorId: userId,
        },
    });

    res.json({ note });
}
