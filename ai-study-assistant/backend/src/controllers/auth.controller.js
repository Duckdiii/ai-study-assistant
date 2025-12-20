import { loginUser, registerUser } from "../services/auth.service.js";
import prisma from "../config/prisma.js";

export async function authMeHandler(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user });
    } catch (err) {
        console.error("authMe error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function register(req, res) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password, name are required" });
        }

        const { user, accessToken } = await registerUser({ email, password, name });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
        });
    } catch (err) {
        console.error("Register error:", err);
        if (err.message === "Email already registered") {
            return res.status(409).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const { user, accessToken } = await loginUser({ email, password });

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
        });
    } catch (err) {
        console.error("Login error:", err);
        if (err.message === "Invalid email or password") {
            return res.status(401).json({ message: err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
