import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationPanel from './NotificationPanel';

const STORAGE_KEY = 'guanxi_notifications';

export function getStoredNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addNotification(notif) {
  const stored = getStoredNotifications();
  const updated = [{ ...notif, id: Date.now(), read: false, timestamp: new Date().toISOString() }, ...stored].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('guanxi_notif_update'));
}

export function markAllRead() {
  const stored = getStoredNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  window.dispatchEvent(new Event('guanxi_notif_update'));
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const reload = () => setNotifications(getStoredNotifications());

  useEffect(() => {
    reload();
    window.addEventListener('guanxi_notif_update', reload);
    return () => window.removeEventListener('guanxi_notif_update', reload);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setOpen(true);
    markAllRead();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative rounded-full h-8 w-8 md:h-11 md:w-11"
        title="Notificações"
      >
        <Bell className="h-4 w-4 md:h-5 md:w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>
      <NotificationPanel isOpen={open} onClose={() => setOpen(false)} notifications={notifications} />
    </>
  );
}