"use client";

import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { AppNotification } from "@/lib/types";

type NotificationListProps = {
  notifications: AppNotification[];
  compact?: boolean;
  emptyMessage: string;
  onMarkRead?: (id: string) => void;
  onArchive?: (id: string) => void;
};

export function NotificationList({
  notifications,
  compact = false,
  emptyMessage,
  onMarkRead,
  onArchive,
}: NotificationListProps) {
  const { t } = useLocale();

  if (notifications.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#64748B]">{emptyMessage}</p>
    );
  }

  return (
    <ul className="space-y-2" aria-label={t.notifications.notifications}>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationItem
            notification={notification}
            compact={compact}
            onMarkRead={onMarkRead}
            onArchive={onArchive}
          />
        </li>
      ))}
    </ul>
  );
}
