"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NotificationList } from "@/components/notifications/NotificationList";
import type { useNotifications } from "@/components/notifications/useNotifications";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/repositories/notifications";

type NotificationPopoverProps = {
  open: boolean;
  onClose: () => void;
  state: ReturnType<typeof useNotifications>;
};

export function NotificationPopover({
  open,
  onClose,
  state,
}: NotificationPopoverProps) {
  const { t } = useLocale();
  const { notifications, unreadCount, userId, refreshCount } = state;
  const panelRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  async function handleMarkRead(id: string) {
    if (!userId) return;
    await markNotificationRead(id, userId);
    await refreshCount();
  }

  async function handleMarkAllRead() {
    if (!userId || unreadCount === 0) return;
    setBusy(true);
    try {
      await markAllNotificationsRead(userId);
      await refreshCount();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-1.5rem,22rem)] rounded-2xl border border-white/[0.1] bg-[#0B1118]/95 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#F8FAFC]">
          {t.notifications.notifications}
        </p>
        {unreadCount > 0 ? (
          <span className="rounded-full bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-semibold text-[#93C5FD]">
            {unreadCount} {t.notifications.unread}
          </span>
        ) : null}
      </div>

      <div className="max-h-[min(60vh,24rem)] overflow-y-auto pr-1">
        <NotificationList
          notifications={notifications.filter((n) => n.status !== "archived")}
          compact
          emptyMessage={t.notifications.noNotificationsYet}
          onMarkRead={(id) => void handleMarkRead(id)}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
        <Button
          type="button"
          size="sm"
          disabled={busy || unreadCount === 0}
          variant="outline"
          className="h-8 flex-1 border-white/[0.08] text-xs text-[#CBD5E1]"
          onClick={() => void handleMarkAllRead()}
        >
          {t.notifications.markAllAsRead}
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/notifications" onClick={onClose} />}
          size="sm"
          className="h-8 flex-1 border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-xs text-[#F8FAFC]"
        >
          {t.notifications.viewAllNotifications}
        </Button>
      </div>
    </div>
  );
}
