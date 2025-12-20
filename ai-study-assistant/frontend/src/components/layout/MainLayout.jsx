import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar"; //Thanh menu
import Toolbar from "@mui/material/Toolbar"; //vùng chứa nút
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip"; //badge nhỏ (role)

import { useAuth } from "../../hooks/useAuth"; //custom hook lấy user hiện tại + hàm logout

export default function MainLayout({ children }) { // children chính là nội dung page con => vd: DashboardPage, ProblemsPage, ...
  const { user, logout } = useAuth();
  const navigate = useNavigate(); //chuyển trang

  const handleLogout = () => { // khi user logout => sẽ điều hướng về trang login
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Study Assistant
          </Typography>

          {/* Nav links */}
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>

          <Button color="inherit" component={Link} to="/problems">
            Problems
          </Button>

          <Button color="inherit" component={Link} to="/chat">
            Chat
          </Button>

          {/*Role-based menu (admin only) */}
          {isAdmin && (
            <>
              <Button color="inherit" component={Link} to="/analytics/overview">
                Analytics
              </Button>
              <Button color="inherit" component={Link} to="/admin/users">
                Users
              </Button>
            </>
          )}

          {/* Right side */}
          {user ? ( //khi đã đăng nhập: show email + role + logout
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
              {/*show role for demo */}
              <Chip
                size="small"
                label={user.role || "USER"}
                variant="outlined"
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)" }}
              />
              <Typography variant="body2">{user.email}</Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            //khi chưa đăng nhập: show nút login
            <Button color="inherit" component={Link} to="/login" sx={{ ml: 2 }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>{children}</Container>
    </>
  );
}
