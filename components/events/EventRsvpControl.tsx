"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import {
  getUserEventRsvp,
  setEventRsvp,
} from "@/lib/repositories/event-rsvps";
import type { CarEvent, EventRsvpStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type EventRsvpControlProps = {
  event: CarEvent;
  onCountsChange?: (going: number, interested: number) => void;
};

const STATUSES: EventRsvpStatus[] = ["going", "interested", "not_going"];

export function EventRsvpControl({ event, onCountsChange }: EventRsvpControlProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<EventRsvpStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginHref = `${brand.nav.login.href}?next=${encodeURIComponent(`/events/${event.slug ?? event.id}`)}`;

  useEffect(() => {
    if (!user) {
      setStatus(null);
      return;
    }
    void getUserEventRsvp(event.id, user.uid).then((rsvp) => {
      setStatus(rsvp?.status ?? null);
    });
  }, [user, event.id]);

  const select = useCallback(
    async (next: EventRsvpStatus) => {
      if (!user) {
        router.push(loginHref);
        return;
      }
      setBusy(true);
      setError(null);
      const prev = status;
      setStatus(next);
      try {
        await setEventRsvp(event.id, user.uid, next);
        const going = next === "going" ? (event.goingCount ?? 0) + (prev === "going" ? 0 : 1) - (prev === "going" ? 0 : 0) : event.goingCount ?? 0;
        onCountsChange?.(event.goingCount ?? 0, event.interestedCount ?? 0);
      } catch {
        setStatus(prev);
        setError(t.community.rsvpError);
      } finally {
        setBusy(false);
      }
    },
    [user, status, event, router, loginHref, onCountsChange, t.community.rsvpError]
  );

  const labelFor = (s: EventRsvpStatus) => {
    if (s === "going") return t.community.going;
    if (s === "interested") return t.community.interested;
    return t.community.notGoing;
  };

  if (loading) {
    return <div className="h-10 animate-pulse rounded-lg bg-white/5" />;
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        {t.community.rsvp}
      </p>
      {!user ? (
        <Button
          nativeButton={false}
          render={<Link href={loginHref} />}
          size="sm"
          className="border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC]"
        >
          {t.community.signInToRsvp}
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy || event.status === "cancelled"}
              onClick={() => void select(s)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                status === s
                  ? "border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
                  : "border-white/[0.08] bg-white/[0.03] text-[#94A3B8] hover:text-[#F8FAFC]"
              )}
            >
              {busy && status === s ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                labelFor(s)
              )}
            </button>
          ))}
        </div>
      )}
      {error ? <p className="mt-2 text-[10px] text-red-300">{error}</p> : null}
    </div>
  );
}
