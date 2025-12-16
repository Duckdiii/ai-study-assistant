import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAuth({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  // Đợi auth “khởi động xong”
  if (booting) return <div style={{ padding: 20 }}>Loading...</div>;

  // Chưa login → đá về /login + nhớ route đang muốn vào
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đã login → cho đi tiếp
  return children;
}
