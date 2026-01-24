import { useEffect, useState } from "react";

export default function NotificationToast({ notifications }) {
  const [toasts, setToasts] = useState([]);

  // Watch for new notifications
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const newNotifs = notifications.filter(n => !n.read && !toasts.some(t => t._id === n._id));
    if (newNotifs.length === 0) return;

    // Add new notifications to toast list
    setToasts(prev => [...prev, ...newNotifs]);

    // Auto-remove after 5 seconds
    newNotifs.forEach(n => {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t._id !== n._id));
      }, 5000);
    });
  }, [notifications, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      zIndex: 9999
    }}>
      {toasts.map(notif => (
        <div
          key={notif._id}
          style={{
            background: "#333",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            minWidth: "250px",
            fontSize: "0.9rem"
          }}
        >
          <strong>{notif.title || "Notification"}</strong>
          <div>{notif.message}</div>
        </div>
      ))}
    </div>
  );
}
