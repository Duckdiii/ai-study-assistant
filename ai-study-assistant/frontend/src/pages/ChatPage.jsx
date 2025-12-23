import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { getChatHistory } from "../api/chatApi";

export default function ChatPage() {
  const { user, socket } = useAuth(); //Lấy user hiện tại và socket (kết nối realtime)
  const [roomDraft, setRoomDraft] = useState("global"); //Input người dùng đang gõ để đổi phòng chat
  const [currentRoom, setCurrentRoom] = useState("global"); //Phòng chat hiện tại đang tham gia
  const [messages, setMessages] = useState([]);//Danh sách tin nhắn của phòng
  const [input, setInput] = useState("");//Nội dung tin nhắn đang gõ
  const [err, setErr] = useState(""); //Thông báo lỗi (nếu có).
  const [loading, setLoading] = useState(false); //Trạng thái loading khi gửi/nhận dữ liệu
  const [connected, setConnected] = useState(false); //Trạng thái socket đã kết nối hay chưa
  //Là useRef lưu giá trị phòng hiện tại nhưng không gây re-render
  const activeRoomRef = useRef(currentRoom); //Ref để giữ giá trị phòng hiện tại mà không gây re-render
  const bottomRef = useRef(null); //Ref tới phần tử cuối danh sách tin nhắn (dùng để scroll xuống cuối).

  useEffect(() => { // cập nhật giá trị ref mỗi khi currentRoom đổi.
    activeRoomRef.current = currentRoom;
  }, [currentRoom]);

  // Thiết lập sự kiện kết nối socket
  useEffect(() => {
    if (!socket) { //Nếu chưa có socket → set connected = false và dừng.
      setConnected(false);
      return;
    }

    const onConnect = () => setConnected(true); //Khi socket kết nối thành công → set connected = true
    const onDisconnect = () => setConnected(false); //Khi socket ngắt kết nối → set connected = false

    socket.on("connect", onConnect); // thiết lập sự kiện kết nối
    socket.on("disconnect", onDisconnect); // thiết lập sự kiện ngắt kết nối
    setConnected(socket.connected); //Cập nhật trạng thái kết nối ban đầu

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // Lắng nghe tin nhắn mới từ server
  useEffect(() => { // chạy khi socket thay đổi
    if (!socket) return;

    const handleMessage = (msg) => {
      if (msg?.roomId && msg.roomId !== activeRoomRef.current) return;
      setMessages((prev) => // thêm message vào list nếu chưa tồn tại (tránh duplicate theo id).
        prev.some((m) => m.id && msg.id && m.id === msg.id) ? prev : [...prev, msg]
      );
    };

    socket.on("chat:message", handleMessage);
    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      joinRoom(currentRoom); //tham gia phòng chat hiện tại.
    }
  }, [socket]); //nó chỉ chạy khi socket được tạo/kết nối lại 

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); //mỗi khi messages thay đổi (có tin nhắn mới), nó sẽ scroll xuống cuối danh sách với hiệu ứng mượt mà

  // Hàm tham gia phòng chat
  const joinRoom = async (nextRoom) => {
    const room = (nextRoom || "").trim() || "global";
    if (!socket) {
      setErr("Socket not connected yet.");
      return;
    }

    setErr("");//reset lỗi
    setLoading(true); // bật loading
    socket.emit("chat:joinRoom", room); // gửi yêu cầu join lên server
    activeRoomRef.current = room;
    setCurrentRoom(room);//cập nhật phòng hiện tại
    setMessages([]); // reset list tin nhắn

    try {
      const res = await getChatHistory({ roomId: room, page: 1, pageSize: 50 }); //lấy lịch sử chat 50 tin gần nhất.
      setMessages(res.data?.items ?? res.data ?? []); // lấy thành công thì hiện lại message
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  // hàm gửi tin nhắn
  const onSend = () => {
    const text = input.trim();
    if (!text) return;
    if (!socket) {
      setErr("Socket not connected yet.");
      return;
    }
    setErr("");
    socket.emit("chat:message", { roomId: currentRoom, content: text }); //Gửi tin nhắn lên server, kèm phòng hiện tạ
    setInput("");
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
        <Typography variant="h5" sx={{ flex: 1 }}>
          Realtime Chat
        </Typography>
        <Chip
          size="small"
          label={connected ? "Connected" : "Disconnected"}
          color={connected ? "success" : "default"}
        />
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
            <TextField
              label="Room ID"
              value={roomDraft}
              onChange={(e) => setRoomDraft(e.target.value)}
              placeholder="global"
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              onClick={() => joinRoom(roomDraft)}
              disabled={!socket || loading}
            >
              Join room
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">Room</Typography>
              <Chip size="small" label={currentRoom} />
            </Stack>
            <Divider />

            <Box
              sx={{
                maxHeight: 420,
                overflowY: "auto",
                p: 1,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack spacing={1}>
                {messages.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No messages yet.
                  </Typography>
                )}

                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  const name = msg.senderName || (isMe ? "You" : "User");
                  const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleString()
                    : "";
                  return (
                    <Box
                      key={msg.id || `${msg.senderId}-${msg.createdAt}-${msg.content}`}
                      sx={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}
                    >
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: isMe ? "primary.main" : "grey.100",
                          color: isMe ? "primary.contrastText" : "text.primary",
                          maxWidth: "75%",
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {name} {time ? `• ${time}` : ""}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {msg.content}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                multiline
                minRows={2}
              />
              <Button variant="contained" onClick={onSend} disabled={!socket || !connected}>
                Send
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
