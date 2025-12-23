import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socket";

const AuthContext = createContext(null); //tạo một “kho chung” cho trạng thái đăng nhập
                        //Sau này các component dùng useContext(AuthContext) hoặc custom hook useAuth() để lấy user, login, logout, v.v.

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

//utils để lưu/đọc/xóa token và user trong localStorage
function readStoredUser() { //lấy user đã lưu để giữ trạng thái đăng nhập sau khi reload trang
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeStoredUser(user) { //Hàm này lưu user vào localStorage
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}
function clearStoredAuth() { // xóa khỏi localStorage
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}
function safeDecodeJwt(token) {
  try {
    const parts = token.split(".");
    //WT có dạng header.payload.signature
    
    if (parts.length !== 3) return null;
    
    const payload = parts[1]; //lấy phần payload

    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/")); //được encode theo base64url → đổi -/_ về +//, rồi atob để decode.

    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}
//-------------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser()); //Lưu thông tin user hiện tại
  const [booting, setBooting] = useState(true); //Trạng thái “đang khởi động” (kiểm tra token trong localStorage và fetch /auth/me)
  const [socket, setSocket] = useState(null); //State lưu socket instance để component khác dùng
  const socketRef = useRef(null); //Ref giữ socket thực tế

  //flow
  useEffect(() => { 
    const token = localStorage.getItem(TOKEN_KEY); //Lấy token đã lưu -> token còn trong localStorage -> app tạm giả định là user đã từng đăng nhập

    if (!token) {
      setUser(null); //setUser(null) → coi như chưa đăng nhập.
      setBooting(false); //setBooting(false) → kết thúc trạng thái khởi động.
      return;
    }

    const cachedUser = readStoredUser(); //Đọc user đã cache.
    if (cachedUser) {
      setUser(cachedUser); // để UI hiển thị ngay, không phải chờ API.
    }

    connectSocket(token); //Mở kết nối socket với token đã lưu.

    fetchMeIfAvailable().finally(() => setBooting(false));
  }, []); //chạy một lần

  const fetchMeIfAvailable = async () => {
    try {
      const res = await apiClient.get("/auth/me"); //Gọi API lấy user hiện tại 
      const u = res.data?.user ?? res.data;
      if (u) {
        setUser(u); //Cập nhật state user
        writeStoredUser(u); // Lưu user vào localStorage để giữ đăng nhập sau reload.
      }
      return u;
    } catch (err) { // lỗi và làm điều ngược lại
      const status = err?.response?.status;
      if (status === 401) {
        clearStoredAuth();
        setUser(null);
      }
      return null;
    }
  };

  const connectSocket = (token) => { //thiết lập kết nối socket mới
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    const s = createSocket(token); //Tạo socket mới có kèm token để auth

    s.on("connect", () => {
      console.log("socket connected:", s.id);
    });

    s.on("connect_error", (e) => {
      console.error("socket error:", e.message);
    });

    s.on("message:new", (payload) => {
      console.log("NEW MESSAGE:", payload);
    });

    socketRef.current = s;
    setSocket(s);
  };

  const login = async (email, password) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const accessToken = res.data?.accessToken;
    const u = res.data?.user;

    if (!accessToken || !u) {
      throw new Error("Invalid login response: missing accessToken or user");
    }

    localStorage.setItem(TOKEN_KEY, accessToken); //Lưu token vào localStorage
    writeStoredUser(u); //Lưu user vào localStorage
    setUser(u); //cập nhật state đăng nhập
    connectSocket(accessToken); //mở socket realtime
    return u;
  };

  const register = async (name, email, password) => {
    const res = await apiClient.post("/auth/register", { name, email, password });
    const accessToken = res.data?.accessToken;
    const u = res.data?.user;

    if (!accessToken || !u) {
      throw new Error("Invalid register response: missing accessToken or user");
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    writeStoredUser(u);
    setUser(u);
    connectSocket(accessToken);
    return u;
  };

  const logout = async () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    clearStoredAuth();
    setUser(null);
  };

  const startGoogleLogin = () => {
    const base = apiClient.defaults.baseURL || "http://localhost:4000";
    window.location.href = `${base}/auth/google`; ////URL hiện tại của trình duyệt -> Nếu gán giá trị mới cho nó, trình duyệt sẽ chuyển trang sang URL đó.
  };

  const completeOAuthLogin = async (jwtTokenFromGoogle) => {
    if (!jwtTokenFromGoogle) throw new Error("Missing OAuth token");

    localStorage.setItem(TOKEN_KEY, jwtTokenFromGoogle); //Lưu token vào localStorage

    const u = await fetchMeIfAvailable(); //Lấy user thật từ backend
    connectSocket(jwtTokenFromGoogle); //Mở socket với token mới
    if (u) return u;

    const payload = safeDecodeJwt(jwtTokenFromGoogle); // nếu không lấy được user từ backend, tạm tạo user từ payload trong JWT
    const fallbackUser = {
      id: payload?.userId ?? "unknown",
      email: "google-user",
      role: payload?.role ?? "USER",
    };
    writeStoredUser(fallbackUser);
    setUser(fallbackUser);
    return fallbackUser;
  };

  const value = useMemo( //
    () => ({
      user,
      booting,
      socket,
      login,
      register,
      logout,
      startGoogleLogin,
      completeOAuthLogin,
    }),
    [user, booting, socket]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
