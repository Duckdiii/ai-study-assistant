import { useEffect, useMemo, useState } from "react";
import { Alert, Card, CardContent, Grid, Stack, Typography, Box } from "@mui/material";
import { analyticsOverview } from "../api/analyticsApi";
import { useAuth } from "../hooks/useAuth";

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

function BarChart({ title, data, labelKey, valueKey }) {
  const maxValue = Math.max(1, ...data.map((d) => d[valueKey] ?? 0));

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <Stack spacing={1} sx={{ mt: 2 }}>
          {data.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No data.
            </Typography>
          )}
          {data.map((item) => {
            const value = item[valueKey] ?? 0;
            const pct = Math.round((value / maxValue) * 100);
            return (
              <Stack key={item[labelKey]} direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ width: 120, flexShrink: 0 }}>
                  {item[labelKey]}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    height: 10,
                    bgcolor: "grey.200",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: "primary.main" }} />
                </Box>
                <Typography variant="caption" sx={{ width: 32, textAlign: "right" }}>
                  {value}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsOverviewPage() {
  const { user } = useAuth(); // lấy thông tin user hiện tại
  const [data, setData] = useState(null); //dữ liệu analytics overview
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") return;
    setLoading(true);
    setErr("");
    analyticsOverview()
      .then((res) => setData(res.data))
      .catch((e) => setErr(e?.response?.data?.message || e?.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [user]);

  const statusData = useMemo(() => {
    if (data?.problemsByStatus?.length) return data.problemsByStatus;
    return [
      { status: "SOLVED", count: data?.solvedCount ?? 0 },
      { status: "PENDING", count: data?.pendingCount ?? 0 },
    ];
  }, [data]);

  const subjectData = useMemo(() => data?.problemsBySubject ?? [], [data]);
  const aiByDay = useMemo(() => data?.aiCallsByDay ?? [], [data]);

  if (!user) return null;

  if (user.role !== "ADMIN") {
    return <Alert severity="warning">Admin only.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Analytics Overview</Typography>

      {err && <Alert severity="error">{err}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total problems" value={data?.totalProblems ?? "-"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Solved" value={data?.solvedCount ?? "-"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending" value={data?.pendingCount ?? "-"} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="AI calls (7 days)" value={data?.aiCallsLast7Days ?? "-"} />
        </Grid>
      </Grid>

      {loading && (
        <Typography variant="body2" color="text.secondary">
          Loading analytics...
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <BarChart title="Problems by status" data={statusData} labelKey="status" valueKey="count" />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarChart
            title="Problems by subject"
            data={subjectData}
            labelKey="subject"
            valueKey="count"
          />
        </Grid>
        <Grid item xs={12}>
          <BarChart title="AI usage by day" data={aiByDay} labelKey="date" valueKey="count" />
        </Grid>
      </Grid>
    </Stack>
  );
}
