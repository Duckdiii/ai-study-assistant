import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

// (optional) decode JWT để fallback user khi /auth/me fail
function safeDecodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [booting, setBooting] = useState(true);

  const fetchMeIfAvailable = async () => {
    try {
      // backend của bạn đang có /auth/me
      const res = await apiClient.get("/auth/me");
      const u = res.data?.user ?? res.data;
      if (u) {
        setUser(u);
        writeStoredUser(u);
      }
      return u;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        clearStoredAuth();
        setUser(null);
      }
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    // Không có token => coi như chưa login
    if (!token) {
      setUser(null);
      setBooting(false);
      return;
    }

    // Có token => show user cache trước cho nhanh
    const cachedUser = readStoredUser();
    if (cachedUser) setUser(cachedUser);

    // Rồi gọi /auth/me để xác thực token + lấy user mới nhất
    fetchMeIfAvailable().finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const accessToken = res.data?.accessToken;
    const u = res.data?.user;

    if (!accessToken || !u) {
      throw new Error("Invalid login response: missing accessToken or user");
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    writeStoredUser(u);
    setUser(u);
    return u;
  };

  const logout = async () => {
    clearStoredAuth();
    setUser(null);
  };

  // Start Google OAuth: backend sẽ redirect qua Google
  const startGoogleLogin = () => {
    const base = apiClient.defaults.baseURL || "http://localhost:4000";
    window.location.href = `${base}/auth/google`;
  };

  // Sau khi backend redirect về frontend kèm ?token=...
  const completeOAuthLogin = async (jwtTokenFromGoogle) => {
    if (!jwtTokenFromGoogle) throw new Error("Missing OAuth token");

    localStorage.setItem(TOKEN_KEY, jwtTokenFromGoogle);

    const u = await fetchMeIfAvailable();
    if (u) return u;

    // fallback nếu /auth/me lỗi (đỡ trắng UI)
    const payload = safeDecodeJwt(jwtTokenFromGoogle);
    const fallbackUser = {
      id: payload?.userId ?? "unknown",
      email: "google-user",
      role: payload?.role ?? "USER",
    };
    writeStoredUser(fallbackUser);
    setUser(fallbackUser);
    return fallbackUser;
  };

  const value = useMemo(
    () => ({ user, booting, login, logout, startGoogleLogin, completeOAuthLogin }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
