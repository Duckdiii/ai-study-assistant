import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
} from "@mui/material";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name || !email || !password) {
      setErr("Name, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Register failed");
    } finally {
      setSubmitting(false);
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
            <Typography variant="h5">Register</Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new account to access the app.
            </Typography>

            {err && <Alert severity="error">{err}</Alert>}

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
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
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <Button type="submit" variant="contained" disabled={submitting}>
                  Create account
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
