"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Megaphone,
  PartyPopper,
  QrCode,
} from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: AppNotification;
  compact?: boolean;
  onMarkRead?: (id: string) => void;
  onArchive?: (id: string) => void;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function typeIcon(type: AppNotification["type"]) {
  switch (type) {
    case "club_announcement":
      return Megaphone;
    case "club_event_created":
      return PartyPopper;
    case "event_updated":
      return CalendarClock;
    case "event_cancelled":
      return AlertTriangle;
    case "event_checkin_open":
      return QrCode;
    default:
      return Bell;
  }
}

function accentClass(type: AppNotification["type"]): string {
  switch (type) {
    case "event_cancelled":
      return "border-red-500/35 bg-red-500/10 text-red-200";
    case "event_updated":
      return "border-amber-500/35 bg-amber-500/10 text-amber-100";
    case "event_checkin_open":
      return "border-[#22C55E]/35 bg-[#22C55E]/10 text-[#86EFAC]";
    case "club_announcement":
      return "border-[#A855F7]/35 bg-[#A855F7]/10 text-[#E9D5FF]";
    case "club_event_created":
      return "border-[#3B82F6]/35 bg-[#3B82F6]/10 text-[#93C5FD]";
    default:
      return "border-white/[0.1] bg-white/[0.04] text-[#CBD5E1]";
  }
}

export function NotificationItem({
  notification,
  compact = false,
  onMarkRead,
  onArchive,
}: NotificationItemProps) {
  const { t } = useLocale();
  const unread = notification.status === "unread";
  const Icon = typeIcon(notification.type);

  const typeLabel = (() => {
    switch (notification.type) {
      case "club_announcement":
        return t.notifications.newClubAnnouncement;
      case "club_event_created":
        return t.notifications.newEventFromFollowedClub;
      case "event_updated":
        return t.notifications.eventUpdated;
      case "event_cancelled":
        return t.notifications.eventCancelled;
      case "event_checkin_open":
        return t.notifications.eventCheckInOpen;
      case "garage_followed":
        return t.notifications.garageFollowed;
      default:
        return notification.title;
    }
  })();

  return (
    <article
      className={cn(
        "rounded-xl border p-3 transition",
        unread
          ? "border-[#3B82F6]/25 bg-[#151B24]/80 shadow-[0_0_24px_-12px_rgba(59,130,246,0.45)]"
          : "border-white/[0.06] bg-[#0B1118]/50",
        compact && "p-2.5"
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            accentClass(notification.type)
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              {typeLabel}
            </p>
            <span className="shrink-0 text-[10px] text-[#64748B]">
              {relativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 font-medium text-[#F8FAFC]">{notification.title}</p>
          <p className="mt-1 text-sm leading-snug text-[#94A3B8]">
            {notification.body}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {notification.actionUrl ? (
              <Link
                href={notification.actionUrl}
                className="text-xs font-medium text-[#3B82F6] hover:underline"
              >
                {t.notifications.viewAction}
              </Link>
            ) : null}
            {unread && onMarkRead ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-white/[0.08] px-2 text-[10px] text-[#CBD5E1]"
                onClick={() => onMarkRead(notification.id)}
              >
                {t.notifications.markAsRead}
              </Button>
            ) : null}
            {!compact && onArchive && notification.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-white/[0.08] px-2 text-[10px] text-[#64748B]"
                onClick={() => onArchive(notification.id)}
              >
                {t.notifications.archive}
              </Button>
            ) : null}
          </div>
        </div>
        {unread ? (
          <span
            className="mt-1 size-2 shrink-0 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            aria-hidden
          />
        ) : null}
      </div>
    </article>
  );
}
