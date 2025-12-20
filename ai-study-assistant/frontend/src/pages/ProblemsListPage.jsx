import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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
  Pagination,
  Alert,
} from "@mui/material";
import { createProblem, getProblems } from "../api/problemsApi";

function StatusChip({ status }) {
  const label = status || "PENDING";
  return <Chip size="small" label={label} />;
}

function ProblemCard({ p }) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" noWrap>
            {p.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={p.subject || "General"} />
            <StatusChip status={p.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {(p.content || "").slice(0, 120)}
          </Typography>
          <Box>
            <Button component={RouterLink} to={`/problems/${p.id}`} size="small" variant="outlined">
              Open
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProblemsListPage() {

  const [q, setQ] = useState(""); // search query
  //q là giá trị hiện tại của ô search (query), ban đầu là chuỗi rỗng "".
  //setQ là hàm để cập nhật q khi người dùng gõ vào ô tìm kiếm.
  const [subject, setSubject] = useState("all"); // filter subject
  const [status, setStatus] = useState("all");// filter status
  const [sort, setSort] = useState("createdAt:desc"); // sort order

  const [page, setPage] = useState(1); // current page
  const pageSize = 8; // items per page

  const [items, setItems] = useState([]); // list of problems
  const [totalPages, setTotalPages] = useState(1); // total number of pages
  const [err, setErr] = useState(""); // error message

  const [open, setOpen] = useState(false); // new problem dialog open state
  const [title, setTitle] = useState(""); // new problem title
  const [content, setContent] = useState(""); // new problem content
  const [newSubject, setNewSubject] = useState("General"); // new problem subject

  //Dùng để lấy danh sách (search, lọc, trang, sort)
  const params = useMemo(() => { //giúp ghi nhớ kết quả, Chỉ khi deps thay đổi thì mới tính lại
    const p = {
      q: q || undefined, //q = query
      subject: subject === "all" ? undefined : subject,
      status: status === "all" ? undefined : status,
      page,
      pageSize,
      sort,
    };
    return p;
  }, [q, subject, status, page, pageSize, sort]); //chỉ khi một trong các deps thay đổi thì mới tính lại params

  //Dùng để load danh sách problems
  const load = async () => {
    setErr(""); // reset lỗi
    try {
      const res = await getProblems(params); // lấy params ở trên

      //Nếu API trả về mảng trực tiếp
      const data = res.data;
      if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
        return;
      }
      
      //Nếu API trả về object có phân trang
      setItems(data.items || []);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / pageSize) || 1);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load problems");
    }
  };

  useEffect(() => {
    load();
  }, [params]); //Mỗi khi params thay đổi (search/filter/page/sort), nó gọi load() để lấy lại danh sách mới.

  const onCreate = async () => {
    setErr(""); // reset lỗi
    if (!title.trim()) { //Nếu title rỗng → báo lỗi và dừng
      setErr("Title is required");
      return;
    }
    try {
      await createProblem({ title: title.trim(), content, subject: newSubject });
      setOpen(false); //đóng dialog “New problem”
      setTitle(""); // xóa title, content, subject đã nhập
      setContent("");
      setNewSubject("General");
      setPage(1);
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Create failed");
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Problems
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          New
        </Button>
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Select
                fullWidth
                value={subject}
                onChange={(e) => {
                  setPage(1);
                  setSubject(e.target.value);
                }}
              >
                <MenuItem value="all">All subjects</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="CS">CS</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12} md={2}>
              <Select
                fullWidth
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
              >
                <MenuItem value="all">All status</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="SOLVED">SOLVED</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12} md={3}>
              <Select
                fullWidth
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
              >
                <MenuItem value="createdAt:desc">Newest</MenuItem>
                <MenuItem value="createdAt:asc">Oldest</MenuItem>
                <MenuItem value="title:asc">Title A→Z</MenuItem>
                <MenuItem value="title:desc">Title Z→A</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {items.map((p) => (
          <Grid item key={p.id} xs={12} sm={6} md={3}>
            <ProblemCard p={p} />
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New problem</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Math">Math</MenuItem>
              <MenuItem value="Physics">Physics</MenuItem>
              <MenuItem value="CS">CS</MenuItem>
            </Select>
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={onCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
