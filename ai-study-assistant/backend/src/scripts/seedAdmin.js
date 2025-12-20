import bcrypt from "bcrypt";
import dotenv from "dotenv";
import prisma from "../config/prisma.js";

dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Admin";

async function seedAdmin() {
    if (!email || !password) {
        console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
        process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        const updated = await prisma.user.update({
            where: { email },
            data: { role: "ADMIN", password: hashed, name },
        });
        console.log(`Updated admin user: ${updated.email}`);
        return;
    }

    const created = await prisma.user.create({
        data: {
            email,
            name,
            password: hashed,
            role: "ADMIN",
        },
    });

    console.log(`Created admin user: ${created.email}`);
}

seedAdmin()
    .catch((err) => {
        console.error("seedAdmin error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
