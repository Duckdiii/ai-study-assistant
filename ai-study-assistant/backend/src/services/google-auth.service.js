import prisma from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

// Lấy thông tin user từ token của Google
async function fetchGoogleUser(accessToken) {
    const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Google user info");
    }

    return res.json(); // { sub, email, name, picture, ... }
}

// Đổi code -> access_token + id_token
async function exchangeCodeForTokens(code) {
    const body = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
    });

    if (!res.ok) {
        console.error(await res.text());
        throw new Error("Failed to exchange code for tokens");
    }

    return res.json(); // { access_token, id_token, ... }
}

// findOrCreate user dựa trên Google account
export async function handleGoogleLogin(code) {
    // 1. Đổi code -> access token
    const tokenResponse = await exchangeCodeForTokens(code);
    const accessToken = tokenResponse.access_token;

    // 2. Lấy thông tin user
    const googleUser = await fetchGoogleUser(accessToken);
    const { sub: googleId, email, name } = googleUser;

    if (!email) {
        throw new Error("Google account has no email");
    }

    // 3. Tìm OAuthAccount trước
    let oauth = await prisma.oAuthAccount.findUnique({
        where: {
            provider_providerUserId: {
                provider: "google",
                providerUserId: googleId,
            },
        },
        include: { user: true },
    });

    let user;

    if (oauth && oauth.user) {
        user = oauth.user;
    } else {
        // Không có OAuthAccount → tìm user theo email
        user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || "Google User",
                    // password để null (login bằng Google)
                },
            });
        }

        // Tạo OAuthAccount record
        oauth = await prisma.oAuthAccount.create({
            data: {
                provider: "google",
                providerUserId: googleId,
                accessToken,
                userId: user.id,
            },
        });
    }

    // 4. Generate JWT giống login thường
    const jwtToken = signAccessToken({
        userId: user.id,
        role: user.role,
    });

    return { user, jwtToken };
}
