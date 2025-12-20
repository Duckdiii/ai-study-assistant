import prisma from "../config/prisma.js";

const VALID_ROLES = new Set(["ADMIN", "USER"]);

export async function listUsersHandler(req, res) {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        res.json({ items: users });
    } catch (err) {
        console.error("listUsers error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUserRoleHandler(req, res) {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body;

        if (!Number.isFinite(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        if (!VALID_ROLES.has(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, email: true, name: true, role: true },
        });

        res.json({ message: "User role updated", user: updated });
    } catch (err) {
        if (err.code === "P2025") {
            return res.status(404).json({ message: "User not found" });
        }
        console.error("updateUserRole error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
