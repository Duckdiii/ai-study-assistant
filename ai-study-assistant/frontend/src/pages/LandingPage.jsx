import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function LandingPage() {
  return (
    <Box //nền full màn hình
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "grid",
        placeItems: "center", //căn giữa cái card
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 760,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">AI Study Assistant</Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý bài tập (CRUD), search/filter/sort/pagination, upload file, realtime chat,
              AI giải bài + tóm tắt, và dashboard analytics. Login bằng JWT + Google OAuth2.
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/login" variant="contained">
                Login
              </Button>
              <Button component={RouterLink} to="/register" variant="outlined">
                Register
              </Button>
              <Button component={RouterLink} to="/problems" variant="outlined">
                View problems
              </Button>
              <Button component={RouterLink} to="/chat" variant="outlined">
                Realtime chat
              </Button>
              <Button component={RouterLink} to="/dashboard" variant="outlined">
                Dashboard
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              *Nếu bạn chưa login, một số trang sẽ tự chuyển về Login.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
