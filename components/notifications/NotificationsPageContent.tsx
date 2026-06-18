"use client";

import { useEffect, useState } from "react";

import { NotificationList } from "@/components/notifications/NotificationList";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  archiveNotification,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/repositories/notifications";

type TabId = "all" | "unread";

export function NotificationsPageContent() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { notifications, unreadCount, userId, refreshCount } = useNotifications(50);
  const [tab, setTab] = useState<TabId>("all");
  const [allNotifications, setAllNotifications] = useState(notifications);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) {
      void getUserNotifications(userId, 50).then(setAllNotifications);
    }
  }, [userId, notifications]);

  const visible =
    tab === "unread"
      ? allNotifications.filter((n) => n.status === "unread")
      : allNotifications.filter((n) => n.status !== "archived");

  const emptyMessage =
    tab === "unread" && unreadCount === 0
      ? t.notifications.allCaughtUp
      : t.notifications.noNotificationsYet;

  async function handleMarkRead(id: string) {
    if (!userId) return;
    await markNotificationRead(id, userId);
    setAllNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
      )
    );
    await refreshCount();
  }

  async function handleArchive(id: string) {
    if (!userId) return;
    await archiveNotification(id, userId);
    setAllNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: "archived", archivedAt: new Date().toISOString() }
          : n
      )
    );
    await refreshCount();
  }

  async function handleMarkAllRead() {
    if (!userId || unreadCount === 0) return;
    setBusy(true);
    try {
      await markAllNotificationsRead(userId);
      const fresh = await getUserNotifications(userId, 50);
      setAllNotifications(fresh);
      await refreshCount();
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            ShiftIt
          </p>
          <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
            {t.notifications.notifications}
          </h1>
        </div>
        {unreadCount > 0 ? (
          <Button
            type="button"
            size="sm"
            disabled={busy}
            variant="outline"
            className="border-white/[0.08] text-[#CBD5E1]"
            onClick={() => void handleMarkAllRead()}
          >
            {t.notifications.markAllAsRead}
          </Button>
        ) : null}
      </div>

      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-1">
        {(
          [
            { id: "all" as const, label: t.notifications.all },
            { id: "unread" as const, label: t.notifications.unread },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <NotificationList
        notifications={visible}
        emptyMessage={emptyMessage}
        onMarkRead={(id) => void handleMarkRead(id)}
        onArchive={(id) => void handleArchive(id)}
      />
    </div>
  );
}
