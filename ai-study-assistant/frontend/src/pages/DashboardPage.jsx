import { useEffect, useMemo, useState } from "react";
import { loadDB } from "../mock/db";
import { Grid, Card, CardContent, Typography, Stack } from "@mui/material";

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
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const db = loadDB();
    setProblems(db.problems ?? []);
  }, []);

  const stats = useMemo(() => {
    const total = problems.length;
    const done = problems.filter((p) => p.status === "done").length;
    const inProgress = problems.filter((p) => p.status === "in_progress").length;
    const todo = problems.filter((p) => p.status === "todo").length;

    const freq = {};
    for (const p of problems) freq[p.subject] = (freq[p.subject] || 0) + 1;
    const topSubject = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

    return { total, done, inProgress, todo, topSubject };
  }, [problems]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Dashboard</Typography>
      <Typography variant="body2" color="text.secondary">
        Overview of your study progress (demo from localStorage).
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total problems" value={stats.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Done" value={stats.done} subtitle="Completed tasks" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="In progress" value={stats.inProgress} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Top subject" value={stats.topSubject} />
        </Grid>
      </Grid>
    </Stack>
  );
}
