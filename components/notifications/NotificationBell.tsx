"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const notificationState = useNotifications(12);
  const { unreadCount } = notificationState;
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t.notifications.notifications}
        aria-expanded={open}
        className={cn(
          "relative flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B1118] text-[#64748B] transition hover:border-white/[0.12] hover:text-[#CBD5E1]",
          open && "border-[#3B82F6]/40 text-[#CBD5E1]"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
      <NotificationPopover
        open={open}
        onClose={() => setOpen(false)}
        state={notificationState}
      />
    </div>
  );
}
