import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { FaBell, FaCheck } from 'react-icons/fa';
import { connectSocket, getSocket } from '../realtime/socket';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadNotifications() {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('pc_token');
    if (!token) return undefined;

    const socket = connectSocket(token);
    const onNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification:new', onNewNotification);

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off('notification:new', onNewNotification);
      }
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  async function markRead(notificationId) {
    await api.patch(`/notifications/${notificationId}/read`);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)),
    );
  }

  async function markAllRead() {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <button type="button" className="text-xs text-brand-700" onClick={markAllRead}>Mark all read</button>
          </div>

          {loading && <p className="text-xs text-slate-500">Loading...</p>}
          {!loading && notifications.length === 0 && (
            <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">No notifications yet.</p>
          )}

          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {notifications.map((item) => (
              <div key={item.id} className={`rounded-lg border p-2 text-xs ${item.isRead ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-slate-600">{item.message}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                  {!item.isRead && (
                    <button type="button" className="inline-flex items-center gap-1 rounded bg-brand-600 px-2 py-1 text-[10px] text-white" onClick={() => markRead(item.id)}>
                      <FaCheck />
                      Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
