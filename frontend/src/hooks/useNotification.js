import { useState, useEffect } from "react";
import { fetchUserNotifications, markNotificationRead } from "../services/notificationService";
import { io } from "socket.io-client";

const socket = io("http://localhost:5050"); // replace with your backend URL

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing notifications
  useEffect(() => {
    if (!userId) return;

    async function loadNotifications() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [userId]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!userId) return;

    socket.emit("joinRoom", userId);

    socket.on("security-notification", (notification) => {
      console.log("🔔 Real-time notification:", notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off("security-notification");
    };
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
  };
}
