import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getUsers, updateUserRole } from "../api/adminApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]); //danh sách user để hiển thị trong trang admin
  const [loading, setLoading] = useState(false); //đang load danh sách hay không 
  const [savingId, setSavingId] = useState(null); //id user đang được update role/quyền
  const [err, setErr] = useState(""); // thông báo lỗi

  const load = async () => { // lấy danh sách users
    setErr("");
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data?.items ?? res.data ?? []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); //chỉ chạy 1 lần

  const onChangeRole = async (userId, nextRole) => {
    setErr(""); //reset lỗi
    setSavingId(userId); //đánh dấu user đang được cập nhật
    try {
      const res = await updateUserRole(userId, nextRole); // gọi hàm
      const updated = res.data?.user; // lấy user mới trả về
      setUsers((prev) =>
        prev.map((u) =>//Tạo mảng mới từ mảng cũ
          (u.id === userId ? { ...u, role: updated?.role ?? nextRole } : u))
      );
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Update role failed");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h5" sx={{ flex: 1 }}>
          User Roles
        </Typography>
        {loading && <CircularProgress size={18} />}
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name || "-"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={u.role} />
                      <Select
                        size="small"
                        value={u.role}
                        onChange={(e) => onChangeRole(u.id, e.target.value)}
                        disabled={savingId === u.id}
                      >
                        <MenuItem value="USER">USER</MenuItem>
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                      </Select>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
}
