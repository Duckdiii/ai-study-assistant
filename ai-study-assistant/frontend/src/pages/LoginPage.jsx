import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState("");

  const { login, startGoogleLogin, completeOAuthLogin } = useAuth();
  const nav = useNavigate(); //chuyển trang mà ko cần reload
  const loc = useLocation(); //Trả về thông tin URL hiện tại

  // Nếu backend redirect về frontend kèm token: /login?token=xxx hoặc /oauth-success?token=xxx
  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const token = params.get("token");
    if (!token) return;

    completeOAuthLogin(token)
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
              Login thường (JWT) hoặc Google OAuth2.
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
                <Typography variant="caption" color="text.secondary">
                  Nếu login Google xong, backend sẽ redirect về đây kèm token.
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
