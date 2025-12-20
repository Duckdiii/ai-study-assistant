import prisma from "../config/prisma.js";

export async function attachFilesToProblem({ problemId, user, files }) {
    // Kiểm tra problem tồn tại & quyền của user
    const problem = await prisma.problem.findUnique({
        where: { id: Number(problemId) },
    });

    if (!problem) {
        throw new Error("PROBLEM_NOT_FOUND");
    }

    if (user.role !== "ADMIN" && problem.ownerId !== user.id) {
        throw new Error("FORBIDDEN");
    }

    // Tạo record File cho từng file upload
    const records = await Promise.all(
        files.map((f) =>
            prisma.file.create({ //lưu metadata của nhiều file vào DB
                data: {
                    filename: f.originalname,
                    path: f.path, // đường dẫn trên server
                    mimeType: f.mimetype, // loại file
                    size: f.size,
                    problemId: problem.id,
                },
            })
        )
    );

    return records;
}

export async function getFileMetadata(id, user) {
    const file = await prisma.file.findUnique({
        where: { id: Number(id) },
        include: { problem: true },
    });

    if (!file) return null;

    if (user.role !== "ADMIN" && file.problem.ownerId !== user.id) {
        throw new Error("FORBIDDEN");
    }

    return file;
}
