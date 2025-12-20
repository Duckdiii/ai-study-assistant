import prisma from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

// Lấy thông tin user từ token của Google
async function fetchGoogleUser(accessToken) {
    const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { //gọi endpoint Google OpenID userinfo
        headers: {
            Authorization: `Bearer ${accessToken}`, //Gửi header Authorization chứng minh đã login Google
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Google user info");
    }

    return res.json(); // { sub, email, name, picture, ... }
}

// đổi “authorization code” thành token
async function exchangeCodeForTokens(code) {
    const body = new URLSearchParams({ //làm việc với các tham số trên URL (Query String)
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
    //Đổi code -> access token
    const tokenResponse = await exchangeCodeForTokens(code);
    const accessToken = tokenResponse.access_token;

    //Lấy thông tin user
    const googleUser = await fetchGoogleUser(accessToken);
    const { sub: googleId, email, name } = googleUser;

    if (!email) {
        throw new Error("Google account has no email");
    }

    //Tìm OAuthAccount trước
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

    //Generate JWT giống login thường
    const jwtToken = signAccessToken({
        userId: user.id,
        role: user.role,
    });

    return { user, jwtToken };
}
