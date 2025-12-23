import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  TextField,
  Button,
  MenuItem,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  addNote,
  aiSolve,
  summarize,
  aiHint,
  aiFeedback,
  aiChat,
  deleteProblem,
  downloadFile,
  getNotes,
  getProblemById,
  updateProblem,
  uploadProblemFiles,
} from "../api/problemsApi";

function saveBlob(blob, filename = "download") { // Biến dữ liệu file (Blob) mà backend trả về thành một file tải xuống trên trình duyệt
  const url = URL.createObjectURL(blob); //blob = Binary Large Object, tạo URL tạm trong bộ nhớ
  const a = document.createElement("a");
  a.href = url;
  a.download = filename; //download attribute → bắt trình duyệt tải file với tên này
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProblemDetailPage() {
  const nav = useNavigate();
  const { id } = useParams(); //Lấy id từ URL theo route kiểu /problems/:id

  const [p, setP] = useState(null); //Lưu thông tin chi tiết của problem (bài toán)
  const [notes, setNotes] = useState([]); //Danh sách ghi chú của user cho problem này
  const [files, setFiles] = useState([]); //Danh sách file đính kèm

  const [note, setNote] = useState(""); //N?i dung note ?ang g? trong form

  const [aiMode, setAiMode] = useState("solve");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [llmChoice, setLlmChoice] = useState("auto");

  const [err, setErr] = useState(""); //Lỗi chung để hiển thị message
  const [busy, setBusy] = useState(false); //Trạng thái đang gọi API (loading chung)

  const load = async () => { //dùng để lấy toàn bộ dữ liệu cho trang chi tiết bài toán
    setErr(""); //reset lỗi trước khi gọi API
    try {
      const res = await getProblemById(id);
      const data = res.data?.problem ?? res.data;
      setP(data);

      // notes riêng
      const nres = await getNotes(id);
      setNotes(nres.data?.items ?? nres.data ?? []);

      setFiles(data?.files ?? []); //Files được lấy trực tiếp từ data.files (nếu có)
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load problem");
    }
  };

  useEffect(() => {
    load();
  }, [id]); //mỗi khi id (từ URL) thay đổi → load lại dữ liệu

  const statusLabel = useMemo(() => p?.status || "PENDING", [p?.status]);

  const aiModeLabels = {
    solve: "Solve",
    hint: "Hint",
    feedback: "Feedback",
    chat: "Chat",
    summarize: "Summarize",
  };

  const aiModeHelp = {
    solve: "Solve the problem using its context (optional override text).",
    hint: "Get a short hint without the full solution.",
    feedback: "Score and feedback for your answer.",
    chat: "Chat with AI using the problem context.",
    summarize: "Summarize text (blank uses problem content + notes).",
  };
  const aiPlaceholders = {
    solve: "Optional: ask to solve or clarify...",
    hint: "Optional: ask for a hint...",
    feedback: "Paste your answer to get feedback...",
    chat: "Ask a question...",
    summarize: "Paste text to summarize (blank uses problem context)...",
  };

  const llmOptions = [
    { value: "gemini|gemini-2.5-flash", label: "Gemini 2.5 Flash (cloud)" },
    { value: "ollama|qwen3:1.7b", label: "Ollama qwen3:1.7b (local)" },
  ];

  const parseLlmChoice = (choice) => {
    if (choice === "auto") return {};
    const [provider, ...rest] = String(choice).split("|");
    return { llmProvider: provider, llmModel: rest.join("|") };
  };

  // Thêm note mới vào problem
  const onAddNote = async () => { //Hàm này chạy khi user bấm nút “Add note”
    setErr("");
    if (!note.trim()) return;
    try {
      await addNote(id, note.trim());
      setNote(""); //Sau khi add thành công → xóa nội dung nhập
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Add note failed");
    }
  };

  // Gửi problem lên AI để giải quyết

  const onAiSend = async () => {
    const mode = aiMode;
    const rawText = aiInput.trim();
    const llmSettings = parseLlmChoice(llmChoice);

    setErr("");

    let requestText = rawText;
    if (mode === "summarize" && !requestText) {
      requestText = buildDefaultSummarizeText();
    }

    if (mode === "feedback" && !requestText) {
      setErr("Answer text is required for feedback.");
      return;
    }

    if (mode === "summarize" && !requestText) {
      setErr("No content to summarize.");
      return;
    }

    if (mode === "chat" && !requestText) return;

    let displayText = requestText;
    if (!rawText && (mode === "solve" || mode === "hint" || mode === "summarize")) {
      displayText = "(using problem context)";
    }
    if (!displayText) displayText = requestText || "";
    const userMessage = { role: "user", mode, content: displayText };
    const historySource = [...aiMessages, userMessage];

    setAiMessages(historySource);
    setAiInput("");
    setAiBusy(true);

    try {
      let res;
      if (mode === "solve") {
        res = await aiSolve({ problemId: Number(id), text: rawText || undefined, ...llmSettings });
      } else if (mode === "hint") {
        res = await aiHint({ problemId: Number(id), text: rawText || undefined, ...llmSettings });
      } else if (mode === "feedback") {
        res = await aiFeedback({ problemId: Number(id), answerText: requestText, ...llmSettings });
      } else if (mode === "summarize") {
        res = await summarize({ text: requestText, ...llmSettings });
      } else {
        const history = aiMessages
          .filter((m) => m.mode === "chat")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }));
        res = await aiChat({ problemId: Number(id), message: requestText, history, ...llmSettings });
      }

      const answer = res.data?.answer ?? res.data?.result ?? res.data;
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", mode, content: answer || "" },
      ]);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "AI request failed");
    } finally {
      setAiBusy(false);
    }
  };

  const buildDefaultSummarizeText = () => {
    const parts = []; // để gom từng khối nội dung
    if (p?.title) parts.push(`Title: ${p.title}`); // thêm khối Title
    if (p?.content) parts.push(`Content:\n${p.content}`); //thêm khối Content
    if (Array.isArray(notes) && notes.length) {
      parts.push(
        "Notes:\n" +
        notes.map((n, i) => `- (${i + 1}) ${n.content ?? ""}`).join("\n")
      );
    }
    return parts.join("\n\n").trim(); //ghép các khối bằng một dòng trống giữa chúng
  };

  // Xử lý tóm tắt nội dung

  // Xử lý upload file
  const onUpload = async (e) => { 
    setErr(""); //Xóa lỗi cũ (nếu có)
    const fl = e.target.files; //lấy danh sách file từ input
    if (!fl || fl.length === 0) return;

    setBusy(true); //bật loading
    try {
      const res = await uploadProblemFiles(id, fl);
      const uploaded = res.data?.files ?? res.data ?? []; //lấy danh sách file trả về
      setFiles((prev) => [...prev, ...uploaded]); //cập nhật danh sách file hiện có

    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = ""; //reset input file để lần sau chọn lại
    }
  };

  // Xử lý download file
  const onDownload = async (file) => {
    setErr(""); //xóa lỗi cũ
    setBusy(true); // bật trạng thái loading
    try {
      const res = await downloadFile(file.id);
      saveBlob(res.data, file.filename || "file"); //lưu dữ liệu blob xuống máy, dùng tên file nếu có
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Download failed");
    } finally {
      setBusy(false);
    }
  };

  // Đánh dấu bài toán là đã giải quyết (SOLVED)
  const onMarkSolved = async () => {
    setErr("");
    setBusy(true);
    try {
      await updateProblem(id, { status: "SOLVED" });
      await load(); //reload lại dữ liệu chi tiết để UI cập nhật
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Update status failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setErr("");
    const ok = window.confirm("Delete this problem? This action cannot be undone.");
    if (!ok) return;
    setBusy(true);
    try {
      await deleteProblem(id);
      nav("/problems");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (!p) {
    return <Typography color="text.secondary">Loading...</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{p.title}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={p.subject || "General"} />
          <Chip size="small" label={statusLabel} />
          <Button size="small" variant="outlined" onClick={onMarkSolved} disabled={busy}>
            Mark SOLVED
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={onDelete} disabled={busy}>
            Delete
          </Button>
        </Stack>
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle2">Content</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
            {p.content || "(empty)"}
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle2">Notes</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Add note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button variant="contained" onClick={onAddNote} disabled={busy}>
              Add
            </Button>
          </Stack>

          <List dense sx={{ mt: 1 }}>
            {notes.map((n) => (
              <ListItem key={n.id || `${n.note}-${Math.random()}`}>
                <ListItemText
                  primary={n.note || n.content || String(n)}
                  secondary={n.createdAt ? new Date(n.createdAt).toLocaleString() : null}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="subtitle2">Files</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
            <Button variant="outlined" component="label" disabled={busy}>
              Upload
              <input hidden type="file" multiple onChange={onUpload} />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Upload image/doc theo phase 6.
            </Typography>
          </Stack>

          <List dense sx={{ mt: 1 }}>
            {(files || []).map((f) => (
              <ListItem key={f.id}>
                <ListItemText
                  primary={f.filename}
                  secondary={f.size ? `${f.size} bytes` : null}
                />
                <Button size="small" onClick={() => onDownload(f)} disabled={busy}>
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Divider />

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle2">AI Assistant</Typography>
            <Typography variant="body2" color="text.secondary">
              {aiModeHelp[aiMode]}
            </Typography>
            <Box
              sx={{
                mt: 1,
                maxHeight: 320,
                overflowY: "auto",
                p: 1,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack spacing={1}>
                {aiMessages.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No messages yet.
                  </Typography>
                )}
                {aiMessages.map((m, idx) => (
                  <Box
                    key={`${m.role}-${idx}`}
                    sx={{ textAlign: m.role === "user" ? "right" : "left" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {m.role === "user" ? "You" : "AI"}
                      {m.mode ? ` - ${aiModeLabels[m.mode]}` : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {m.content}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Message"
                placeholder={aiPlaceholders[aiMode]}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onAiSend();
                  }
                }}
                multiline
                minRows={2}
                disabled={aiBusy}
              />
              <TextField
                select
                label="Mode"
                value={aiMode}
                onChange={(e) => setAiMode(e.target.value)}
                size="small"
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="solve">Solve</MenuItem>
                <MenuItem value="hint">Hint</MenuItem>
                <MenuItem value="feedback">Feedback</MenuItem>
                <MenuItem value="chat">Chat</MenuItem>
                <MenuItem value="summarize">Summarize</MenuItem>
              </TextField>
              <TextField
                select
                label="Model"
                value={llmChoice}
                onChange={(e) => setLlmChoice(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
              >
                {llmOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={onAiSend} disabled={aiBusy}>
                {aiBusy ? "Working..." : "Send"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

    </Stack>

  );
}
