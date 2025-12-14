import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  mockAddNote,
  mockGetProblem,
  mockSendChat,
  mockUpdateProblem,
} from "../mock/api";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  TextField,
  Button,
  Divider,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from "@mui/material";

function StatusChip({ status }) {
  const map = {
    todo: { label: "Todo" },
    in_progress: { label: "In progress" },
    done: { label: "Done" },
  };
  return <Chip size="small" variant="outlined" label={map[status]?.label ?? status} />;
}

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);

  // notes + chat
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  // edit dialog
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    difficulty: "",
    content: "",
  });

  const load = async () => {
    const res = await mockGetProblem(id);
    setP(res);
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    await mockUpdateProblem(id, { status });
    load();
  };

  const openEditDialog = () => {
    setForm({
      title: p.title,
      subject: p.subject,
      difficulty: p.difficulty,
      content: p.content,
    });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    await mockUpdateProblem(id, form);
    setOpenEdit(false);
    load();
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await mockAddNote(id, note.trim());
    setNote("");
    load();
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    await mockSendChat(id, msg.trim());
    setMsg("");
    load();
  };

  if (!p) return <Typography color="text.secondary">Loading...</Typography>;

  return (
    <Stack spacing={2}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack spacing={0.5}>
          <Typography variant="h5">{p.title}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" label={p.subject} />
            <StatusChip status={p.status} />
            <Chip size="small" variant="outlined" label={p.difficulty} />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={openEditDialog}>
            Edit
          </Button>
        </Stack>
      </Stack>

      {/* QUICK STATUS CHANGE */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography fontWeight={700}>Status</Typography>
            <Select
              size="small"
              value={p.status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* LEFT */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Typography fontWeight={700}>Description</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {p.content || "No description yet."}
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Typography fontWeight={700}>Notes</Typography>

                <Box component="form" onSubmit={addNote} sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add note..."
                      fullWidth
                    />
                    <Button type="submit" variant="contained">
                      Add
                    </Button>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  {(p.notes ?? []).map((n) => (
                    <Box
                      key={n.id}
                      sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                    >
                      <Typography variant="body2">{n.content}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT: CHAT */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography fontWeight={700}>AI Chat (mock)</Typography>

              <Box
                sx={{
                  mt: 2,
                  height: 260,
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                <Stack spacing={1}>
                  {(p.chat ?? []).map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        alignSelf: c.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        p: 1,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {c.sender === "user" ? "You" : "AI"}
                      </Typography>
                      <Typography variant="body2">{c.content}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box component="form" onSubmit={sendChat} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Ask AI..."
                    fullWidth
                  />
                  <Button type="submit" variant="contained">
                    Send
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit problem</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                label="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                label="Difficulty"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              >
                <MenuItem value="easy">easy</MenuItem>
                <MenuItem value="medium">medium</MenuItem>
                <MenuItem value="hard">hard</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={saveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
