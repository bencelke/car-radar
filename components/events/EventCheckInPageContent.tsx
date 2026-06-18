"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { authedFetch } from "@/lib/client/authed-fetch";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { getUserEventCheckIn } from "@/lib/repositories/event-checkins";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";

type EventCheckInPageContentProps = {
  event: CarEvent;
};

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapErrorCode(code: string, t: ReturnType<typeof useLocale>["t"]): string {
  switch (code) {
    case "invalid_token":
      return t.checkIn.invalidCheckInCode;
    case "token_expired":
      return t.checkIn.checkInCodeExpired;
    case "check_in_closed":
      return t.checkIn.checkInIsClosed;
    case "already_checked_in":
      return t.checkIn.alreadyCheckedIn;
    case "event_cancelled":
      return t.community.eventCancelled;
    default:
      return t.community.saveError;
  }
}

export function EventCheckInPageContent({ event }: EventCheckInPageContentProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { user, loading } = useAuth();
  const [existing, setExisting] = useState<Awaited<
    ReturnType<typeof getUserEventCheckIn>
  > | null>(null);
  const [success, setSuccess] = useState<{ checkedInAt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = event.slug ?? event.id;
  const checkInPath = `/events/${slug}/check-in${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  const loginHref = `${brand.nav.login.href}?next=${encodeURIComponent(checkInPath)}`;

  useEffect(() => {
    if (!user) {
      setExisting(null);
      return;
    }
    void getUserEventCheckIn(event.id, user.uid).then(setExisting);
  }, [user, event.id]);

  const submit = useCallback(async () => {
    if (!token) {
      setError(t.checkIn.invalidCheckInCode);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authedFetch(`/api/events/${event.id}/check-in/verify`, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        checkIn?: { checkedInAt: string };
      };
      if (!res.ok) {
        setError(mapErrorCode(data.error ?? "", t));
        return;
      }
      setSuccess({
        checkedInAt: data.checkIn?.checkedInAt ?? new Date().toISOString(),
      });
      setExisting(null);
    } catch {
      setError(t.community.saveError);
    } finally {
      setBusy(false);
    }
  }, [token, event.id, t]);

  const location = [event.address, event.city, event.country]
    .filter(Boolean)
    .join(" · ");

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (!token) {
    return (
      <CheckInShell event={event}>
        <p className="text-sm text-red-300">{t.checkIn.invalidCheckInCode}</p>
      </CheckInShell>
    );
  }

  if (!user) {
    return (
      <CheckInShell event={event}>
        <p className="text-sm text-[#94A3B8]">{t.checkIn.signInToCheckIn}</p>
        <Button
          nativeButton={false}
          render={<Link href={loginHref} />}
          className="mt-4 w-full border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC]"
        >
          {t.auth.login}
        </Button>
      </CheckInShell>
    );
  }

  if (event.status === "cancelled") {
    return (
      <CheckInShell event={event}>
        <p className="text-sm text-red-300">{t.community.eventCancelled}</p>
      </CheckInShell>
    );
  }

  if (existing || success) {
    const at = success?.checkedInAt ?? existing?.checkedInAt ?? "";
    return (
      <CheckInShell event={event}>
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="size-12 text-[#22C55E]" />
          <p className="font-heading text-lg font-bold text-[#F8FAFC]">
            {t.checkIn.youAreCheckedIn}
          </p>
          {at ? (
            <p className="text-sm text-[#94A3B8]">
              {formatEventTime(at)}
            </p>
          ) : null}
          <Link
            href={eventDetailPath(event)}
            className="mt-2 text-sm text-[#3B82F6] hover:underline"
          >
            {t.auth.continueExploring}
          </Link>
        </div>
      </CheckInShell>
    );
  }

  return (
    <CheckInShell event={event}>
      <div className="space-y-4">
        <div className="rounded-lg border border-white/[0.08] bg-[#151B24]/50 p-3 text-sm text-[#94A3B8]">
          <p className="font-medium text-[#F8FAFC]">{event.title}</p>
          {event.clubName ? <p>{event.clubName}</p> : null}
          <p>{formatEventTime(event.startTime)}</p>
          <p>{location}</p>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-[#151B24]/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
            Signed in as
          </p>
          <p className="text-sm font-medium text-[#F8FAFC]">
            {user.displayName ?? user.email}
          </p>
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button
          type="button"
          disabled={busy || event.checkInStatus !== "open"}
          className="h-12 w-full border border-[#22C55E]/50 bg-[#22C55E]/20 text-base font-semibold text-[#F8FAFC]"
          onClick={() => void submit()}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            t.checkIn.checkInToEvent
          )}
        </Button>
        {event.checkInStatus !== "open" ? (
          <p className="text-center text-xs text-[#64748B]">
            {t.checkIn.checkInIsClosed}
          </p>
        ) : null}
      </div>
    </CheckInShell>
  );
}

function CheckInShell({
  event,
  children,
}: {
  event: CarEvent;
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
        {t.checkIn.eventCheckIn}
      </p>
      <div className="rounded-2xl border border-white/[0.1] bg-[#0B1118]/80 p-5 shadow-[0_0_40px_-16px_rgba(34,197,94,0.35)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}
