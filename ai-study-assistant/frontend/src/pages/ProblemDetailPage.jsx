import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  TextField,
  Button,
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
  const { id } = useParams(); //lấy problemId từ URL

  const [p, setP] = useState(null); //thông tin bài toán (Problem)
  const [notes, setNotes] = useState([]); //ghi chú của user cho bài này
  const [files, setFiles] = useState([]); //danh sách file đính kèm

  const [note, setNote] = useState(""); //nội dung note đang nhập
  const [ask, setAsk] = useState(""); //câu hỏi gửi AI
  const [aiAnswer, setAiAnswer] = useState(""); //câu trả lời từ AI

  const [sumText, setSumText] = useState("");
  const [summary, setSummary] = useState("");
  const [sumBusy, setSumBusy] = useState(false);

  const [err, setErr] = useState(""); //lỗi chung
  const [busy, setBusy] = useState(false); //trạng thái chờ (gọi API)

  const load = async () => { //trách nhiệm LOAD TOÀN BỘ dữ liệu cho trang ProblemDetailPage: Thông tin bài toán + notes + files
    setErr("");
    try {
      const res = await getProblemById(id);
      const data = res.data?.problem ?? res.data;
      setP(data);

      // notes riêng
      const nres = await getNotes(id);
      setNotes(nres.data?.items ?? nres.data ?? []);

      // files: tùy backend trả ở problem hoặc endpoint khác
      setFiles(data?.files ?? []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load problem");
    }
  };

  useEffect(() => {
    load();
  }, [id]); //mỗi khi id (từ URL) thay đổi → load lại dữ liệu

  const statusLabel = useMemo(() => p?.status || "PENDING", [p?.status]);

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

  const onSolve = async () => { //Chạy khi user bấm nút “Solve with AI”
    setErr("");
    setBusy(true); //Khóa UI (loading)
    setAiAnswer(""); //Xóa câu trả lời AI cũ
    try {
      const res = await aiSolve({ problemId: Number(id), text: ask || undefined }); //Gửi bài tập / câu hỏi lên AI
      const answer = res.data?.answer ?? res.data?.result ?? res.data; //Nhận câu trả lời
      setAiAnswer(answer || ""); //Hiển thị kết quả

    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "AI solve failed");
    } finally {
      setBusy(false);
    }
  };
  const buildDefaultSummarizeText = () => {
    const parts = [];
    if (p?.title) parts.push(`Title: ${p.title}`);
    if (p?.content) parts.push(`Content:\n${p.content}`);
    if (Array.isArray(notes) && notes.length) {
      parts.push(
        "Notes:\n" +
        notes.map((n, i) => `- (${i + 1}) ${n.content ?? ""}`).join("\n")
      );
    }
    return parts.join("\n\n").trim();
  };

  const onSummarize = async () => {
    setErr("");
    setSummary("");
    setSumBusy(true);
    try {
      const textToSummarize = (sumText || buildDefaultSummarizeText()).trim();
      if (!textToSummarize) {
        setErr("Không có nội dung để summarize.");
        return;
      }

      const res = await summarize({ text: textToSummarize });

      const out =
        res.data?.summary ?? res.data?.result ?? res.data?.answer ?? res.data;
      setSummary(out ? String(out) : "");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Summarize failed");
    } finally {
      setSumBusy(false);
    }
  };

  const onUpload = async (e) => { //Chạy khi user chọn file để upload
    setErr(""); //Xóa lỗi cũ (nếu có)
    const fl = e.target.files; //các file user vừa chọn
    if (!fl || fl.length === 0) return;

    setBusy(true);
    try {
      const res = await uploadProblemFiles(id, fl);
      const uploaded = res.data?.files ?? res.data ?? [];
      setFiles((prev) => [...prev, ...uploaded]);
      //prev = file cũ
      //uploaded = file mới
      //Gộp lại → không mất file đã upload trước đó
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = ""; //Reset input file
    }
  };

  const onDownload = async (file) => {
    setErr("");
    setBusy(true);
    try {
      const res = await downloadFile(file.id);
      saveBlob(res.data, file.filename || "file");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Download failed");
    } finally {
      setBusy(false);
    }
  };

  const onMarkSolved = async () => {
    setErr("");
    setBusy(true);
    try {
      await updateProblem(id, { status: "SOLVED" });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Update status failed");
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
          <Typography variant="subtitle2">AI Solve</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField
              label="Optional: override text to solve (nếu muốn)"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              multiline
              minRows={3}
            />
            <Button variant="contained" onClick={onSolve} disabled={busy}>
              {busy ? "Solving..." : "Solve"}
            </Button>

            {aiAnswer && (
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                  <Typography variant="subtitle2">Answer</Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap", mt: 1 }}>{aiAnswer}</Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Summarize
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Nhập text dài để tóm tắt. Nếu để trống, hệ thống sẽ tự lấy Content + Notes của problem hiện tại.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={4}
            value={sumText}
            onChange={(e) => setSumText(e.target.value)}
            placeholder="Dán đoạn văn dài vào đây rồi bấm SUMMARIZE..."
            sx={{ mb: 2 }}
          />

          <Button variant="contained" onClick={onSummarize} disabled={sumBusy}>
            {sumBusy ? "SUMMARIZING..." : "SUMMARIZE"}
          </Button>

          {summary && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Summary</Typography>
              <Box
                sx={{
                  whiteSpace: "pre-wrap",
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                  mt: 1,
                }}
              >
                {summary}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

    </Stack>

  );
}
