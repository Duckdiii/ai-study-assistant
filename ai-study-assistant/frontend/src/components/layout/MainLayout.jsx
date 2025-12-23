import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar"; //Thanh menu
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip"; //badge
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

export default function MainLayout({ children }) { // children chính là nội dung page con => vd: DashboardPage, ProblemsPage, ...
  const { user, logout } = useAuth();
  const { unreadCount, lastNotification, markNotificationsRead } = useNotifications();
  const navigate = useNavigate(); //chuyển trang
  const [snackOpen, setSnackOpen] = useState(false); //Snackbar đang mở hay đóng
  const [snack, setSnack] = useState(null); //lưu nội dung thông báo hiện tại

  const handleLogout = () => { // khi user logout => chuyển hướng về trang login
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (!lastNotification) return;
    setSnack(lastNotification);
    setSnackOpen(true);
  }, [lastNotification]);

  const handleSnackClose = (_, reason) => {
    if (reason === "clickaway") return; //user click ra ngoài snackbar -> thì bỏ qua, không đóng
    setSnackOpen(false); //Còn lại thì setSnackOpen(false) để đóng Snackbar
  };

  const handleNotificationsClick = () => { //khi user click vào icon thông báo
    markNotificationsRead();
  };

  const handleSnackView = () => { // chức năng cho nút View
    if (!snack?.link) return;
    markNotificationsRead();
    setSnackOpen(false);
    navigate(snack.link);
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
          {user ? ( //show email + role + logout
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
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
            //chưa login
            <Button color="inherit" component={Link} to="/login" sx={{ ml: 2 }}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>{children}</Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          onClose={handleSnackClose}
          action={
            snack?.link ? (
              <Button color="inherit" size="small" onClick={handleSnackView}>
                View
              </Button>
            ) : null
          }
          sx={{ width: "100%" }}
        >
          <Typography variant="subtitle2">{snack?.title || "Notification"}</Typography>
          <Typography variant="body2">{snack?.message || ""}</Typography>
        </Alert>
      </Snackbar>
    </>
  );
}
