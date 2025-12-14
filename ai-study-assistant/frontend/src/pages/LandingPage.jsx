import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "grid", placeItems: "center", p: 2 }}>
      <Card elevation={0} sx={{ width: "100%", maxWidth: 760, border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4">AI Study Assistant</Typography>
            <Typography variant="body1" color="text.secondary">
              Quản lý bài tập, ghi chú, và chat với AI. Demo frontend hiện dùng localStorage.
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/login" variant="contained">
                Get started
              </Button>
              <Button component={RouterLink} to="/problems" variant="outlined">
                View problems
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Sau này backend sẽ thay mock bằng API thật.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
