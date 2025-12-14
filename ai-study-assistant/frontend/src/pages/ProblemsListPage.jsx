import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { mockCreateProblem, mockListProblems } from "../mock/api";
import {
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";

function StatusChip({ status }) {
  const map = {
    todo: { label: "Todo" },
    in_progress: { label: "In progress" },
    done: { label: "Done" },
  };
  return <Chip size="small" variant="outlined" label={map[status]?.label ?? status} />;
}

function ProblemCard({ p }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        transition: "0.15s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography
            component={RouterLink}
            to={`/problems/${p.id}`}
            variant="h6"
            sx={{ textDecoration: "none", color: "text.primary" }}
          >
            {p.title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={p.subject} />
            <StatusChip status={p.status} />
            <Chip size="small" variant="outlined" label={p.difficulty ?? "easy"} />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {p.content?.trim() ? p.content : "No description yet."}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProblemsListPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 8;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(false);

  // Dialog create
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newDifficulty, setNewDifficulty] = useState("easy");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / limit)), [data.total]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockListProblems({ search, subject, status, page, limit });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, subject, status, page]);

  const onOpenCreate = () => {
    setNewTitle("");
    setNewSubject(subject === "all" ? "General" : subject);
    setNewDifficulty("easy");
    setOpen(true);
  };

  const onCreate = async () => {
    if (!newTitle.trim()) return;
    await mockCreateProblem({
      title: newTitle.trim(),
      subject: newSubject,
      difficulty: newDifficulty,
      content: "",
    });
    setOpen(false);
    setPage(1);
    load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5">Problems</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your exercises (demo data from localStorage).
          </Typography>
        </Box>

        <Button variant="contained" onClick={onOpenCreate}>
          + New Problem
        </Button>
      </Stack>

      {/* Filters */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  label="Subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Math">Math</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="todo">Todo</MenuItem>
                  <MenuItem value="in_progress">In progress</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : data.items.length === 0 ? (
        <Typography color="text.secondary">No problems found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {data.items.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <ProblemCard p={p} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Stack>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New problem</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select label="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                label="Difficulty"
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
              >
                <MenuItem value="easy">easy</MenuItem>
                <MenuItem value="medium">medium</MenuItem>
                <MenuItem value="hard">hard</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={onCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
