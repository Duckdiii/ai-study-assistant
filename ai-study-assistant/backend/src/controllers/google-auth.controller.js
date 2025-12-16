import { handleGoogleLogin } from "../services/google-auth.service.js";

export function googleAuthStart(req, res) {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID, // ID app của bạn trên Google Cloud
        redirect_uri: process.env.GOOGLE_REDIRECT_URI, // URL callback đã đăng ký
        response_type: "code", // Yêu cầu mã ủy quyền
        scope: "openid email profile", 
        access_type: "offline",
        prompt: "consent",
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(url);
}

export async function googleAuthCallback(req, res) {
    try {
        const code = req.query.code;

        if (!code) {
            return res.status(400).json({ message: "Missing code" });
        }

        const { user, jwtToken } = await handleGoogleLogin(code);

        // Cách 1: redirect về frontend với token trên query
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const redirectUrl = `${frontendUrl}/oauth-success?token=${jwtToken}`;

        return res.redirect(redirectUrl);

        // Cách 2 (sau này nếu muốn): set cookie rồi redirect
    } catch (err) {
        console.error("Google OAuth callback error:", err);
        return res.status(500).json({ message: "Google login failed" });
    }
}
