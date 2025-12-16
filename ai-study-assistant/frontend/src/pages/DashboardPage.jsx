import { useEffect, useMemo, useState } from "react";
import { Grid, Card, CardContent, Typography, Stack, Alert } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { analyticsMe, analyticsOverview } from "../api/problemsApi";

function StatCard({ title, value, subtitle }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    analyticsMe()
      .then((res) => setData(res.data))
      .catch((e) => setErr(e?.response?.data?.message || e?.message || "Failed to load analytics"));

    if (user?.role === "ADMIN") {
      analyticsOverview()
        .then((res) => setOverview(res.data))
        .catch(() => {});
    }
  }, [user?.role]);

  const stats = useMemo(() => {
    const src = data || {};
    return {
      totalProblems: src.totalProblems ?? "-",
      solvedCount: src.solvedCount ?? "-",
      pendingCount: src.pendingCount ?? "-",
      aiCallsLast7Days: src.aiCallsLast7Days ?? "-",
    };
  }, [data]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Dashboard</Typography>
      <Typography variant="body2" color="text.secondary">
        Analytics cho user đang đăng nhập{user?.role === "ADMIN" ? " (có thêm overview cho admin)" : ""}.
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total problems" value={stats.totalProblems} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Solved" value={stats.solvedCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending" value={stats.pendingCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="AI calls (7 days)" value={stats.aiCallsLast7Days} />
        </Grid>
      </Grid>

      {user?.role === "ADMIN" && overview && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="subtitle1">Admin overview</Typography>

            <Typography variant="body2" color="text.secondary">
              Total: {overview.totalProblems} | Solved: {overview.solvedCount} | Pending:{" "}
              {overview.pendingCount} | AI calls 7 days: {overview.aiCallsLast7Days}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
