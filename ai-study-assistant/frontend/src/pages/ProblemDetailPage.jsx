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
  const { id } = useParams(); //Lấy id từ URL theo route kiểu /problems/:id

  const [p, setP] = useState(null); //Lưu thông tin chi tiết của problem (bài toán)
  const [notes, setNotes] = useState([]); //Danh sách ghi chú của user cho problem này
  const [files, setFiles] = useState([]); //Danh sách file đính kèm

  const [note, setNote] = useState(""); //Nội dung note đang gõ trong form
  const [ask, setAsk] = useState(""); //Câu hỏi user đang gõ để gửi AI
  const [aiAnswer, setAiAnswer] = useState(""); //câu trả lời từ AI

  const [sumText, setSumText] = useState("");//Dữ liệu đầu vào để tóm tắt (summary)
  const [summary, setSummary] = useState("");// Kết quả tóm tắt
  const [sumBusy, setSumBusy] = useState(false); //Đang chờ API tóm tắt hay không

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

  // ghép nhiều mảnh dữ liệu (title/content/notes) thành 1 đoạn text chuẩn để gửi cho tính năng tóm tắt/AI.
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
  const onSummarize = async () => {
    setErr(""); // Xóa lỗi cũ (nếu có)
    setSummary(""); // Xóa kết quả tóm tắt cũ
    setSumBusy(true); // Đánh dấu đang chờ tóm tắt
    try {
      const textToSummarize = (sumText || buildDefaultSummarizeText()).trim(); //Nếu user đã nhập sumText thì dùng; nếu chưa thì tự build từ title/content/notes.
      if (!textToSummarize) {
        setErr("Không có nội dung để summarize.");
        return;
      }

      const res = await summarize({ text: textToSummarize });

      const out =
        res.data?.summary ?? res.data?.result ?? res.data?.answer ?? res.data;
      setSummary(out ? String(out) : ""); //Hiển thị kết quả tóm tắt
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Summarize failed");
    } finally {
      setSumBusy(false);
    }
  };

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
