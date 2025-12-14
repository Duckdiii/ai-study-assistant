import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Stack,
} from "@mui/material";

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    nav("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            component={RouterLink}
            to="/dashboard"
            variant="h6"
            sx={{ textDecoration: "none", color: "inherit", fontWeight: 800 }}
          >
            AI Study Assistant
          </Typography>

          <Button component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Button>
          <Button component={RouterLink} to="/problems" color="inherit">
            Problems
          </Button>

          <Box sx={{ flex: 1 }} />

          {user && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={user.email} variant="outlined" />
              <Button variant="contained" onClick={onLogout}>
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
