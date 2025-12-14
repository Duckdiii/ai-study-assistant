import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export async function registerUser({ email, password, name }) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error("Email already registered");
    }

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo user
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashed,
            // role dùng default USER từ schema
        },
    });

    // Tạo token luôn sau khi đăng ký (cho tiện)
    const accessToken = signAccessToken({
        userId: user.id,
        role: user.role,
    });

    return { user, accessToken };
}

export async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const accessToken = signAccessToken({
        userId: user.id,
        role: user.role,
    });

    return { user, accessToken };
}
