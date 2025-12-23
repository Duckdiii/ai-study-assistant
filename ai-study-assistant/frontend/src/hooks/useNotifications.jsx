import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { socket, user } = useAuth(); //dùng lại socket từ useAuth
  const [notifications, setNotifications] = useState([]); //Lưu danh sách thông báo
  const [unreadCount, setUnreadCount] = useState(0); //Số thông báo chưa đọc
  const [lastNotification, setLastNotification] = useState(null); //Lưu thông báo mới nhất

  const pushNotification = (note) => {
    setNotifications((prev) => [note, ...prev].slice(0, 50));//chỉ giữ lại 50 thông báo mới nhất
    setUnreadCount((count) => count + 1);//tăng số thông báo chưa đọc
    setLastNotification(note);//cập nhật thông báo mới nhất
  };

  const markNotificationsRead = () => {
    setUnreadCount(0); //đánh dấu tất cả thông báo là đã đọc
  };

  useEffect(() => {
    if (user) return;
    setNotifications([]);
    setUnreadCount(0);
    setLastNotification(null);
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewProblem = (payload) => {
      const note = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "NEW_PROBLEM",
        title: "New problem",
        message: payload?.title || "A new problem was created.",
        link: payload?.problemId ? `/problems/${payload.problemId}` : "/problems",
        createdAt: new Date().toISOString(),
      };
      pushNotification(note);
    };

    const handleAiDone = (payload) => {
      const note = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "AI_DONE",
        title: "AI completed",
        message: payload?.preview || "AI finished processing.",
        link: payload?.problemId ? `/problems/${payload.problemId}` : "/problems",
        createdAt: new Date().toISOString(),
      };
      pushNotification(note);
    };

    socket.on("notification:newProblem", handleNewProblem);
    socket.on("notification:aiDone", handleAiDone);

    return () => {
      socket.off("notification:newProblem", handleNewProblem);
      socket.off("notification:aiDone", handleAiDone);
    };
  }, [socket]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      lastNotification,
      markNotificationsRead,
    }),
    [notifications, unreadCount, lastNotification]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within <NotificationsProvider>");
  return ctx;
}
