"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  getUnreadNotificationCount,
  subscribeUserNotifications,
} from "@/lib/repositories/notifications";
import type { AppNotification } from "@/lib/types";

const POPOVER_LIMIT = 12;

export function useNotifications(limit = POPOVER_LIMIT) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserNotifications(
      user.uid,
      limit,
      (items, count) => {
        setNotifications(items);
        setUnreadCount(count);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, limit]);

  async function refreshCount(): Promise<void> {
    if (!user) return;
    const count = await getUnreadNotificationCount(user.uid);
    setUnreadCount(count);
  }

  return { notifications, unreadCount, loading, refreshCount, userId: user?.uid };
}
