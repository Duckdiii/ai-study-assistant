import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Link,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com"); //State cho email trong form login, mặc định gán sẵn
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState(""); //Lưu lỗi hiển thị khi login thất bại.

  const { login, startGoogleLogin, completeOAuthLogin } = useAuth(); //Lấy các hàm auth từ custom hook
  const nav = useNavigate(); //Hàm điều hướng trang sau khi login.
  const loc = useLocation(); //Lấy thông tin location hiện tại (dùng để redirect sau khi login).

  useEffect(() => {
    const params = new URLSearchParams(loc.search); //Lấy query string từ URL
    const token = params.get("token"); //Lấy token từ query string
    if (!token) return;

    completeOAuthLogin(token) //Nếu có token trong URL (OAuth redirect về), gọi hàm hoàn tất login OAuth
      .then(() => nav("/dashboard"))
      .catch((e) => setErr(e?.message || "OAuth login failed"));
  }, [loc.search]);//Mỗi lần URL query string thay đổi → chạy lại đoạn code này

  const onSubmit = async (e) => {
    e.preventDefault(); // ngăn form submit reload page
    setErr("");
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Login failed");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card
        elevation={0}
        sx={{ width: "100%", maxWidth: 720, border: "1px solid", borderColor: "divider" }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Login</Typography>
            <Typography variant="body2" color="text.secondary">
              New here?{" "}
              <Link component={RouterLink} to="/register">
                Create an account
              </Link>
            </Typography>

            {err && <Alert severity="error">{err}</Alert>}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box component="form" onSubmit={onSubmit} sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Button type="submit" variant="contained">
                    Login
                  </Button>
                </Stack>
              </Box>

              <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", md: "block" } }} />
              <Divider sx={{ display: { xs: "block", md: "none" } }} />

              <Stack spacing={2} sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Or</Typography>
                <Button variant="outlined" onClick={startGoogleLogin}>
                  Continue with Google
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
