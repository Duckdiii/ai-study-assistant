import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    await login(email);
    nav("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Welcome back</Typography>
            <Typography variant="body2" color="text.secondary">
              Login (mock) để demo giao diện frontend. Backend auth sẽ tích hợp sau.
            </Typography>

            <Divider />

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large">
                  Login
                </Button>

                <Typography variant="caption" color="text.secondary">
                  Tip: Bạn có thể nhập email bất kỳ để tạo session demo (localStorage).
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
