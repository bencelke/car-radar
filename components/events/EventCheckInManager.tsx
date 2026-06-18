"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";

import { EventCheckInQrPanel } from "@/components/events/EventCheckInQrPanel";
import { authedFetch } from "@/lib/client/authed-fetch";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { CarEvent, Club, EventCheckIn } from "@/lib/types";

type SessionState = {
  token: string;
  expiresAt: string;
  checkInUrl: string;
};

type EventCheckInManagerProps = {
  event: CarEvent;
  club: Club;
};

export function EventCheckInManager({ event, club }: EventCheckInManagerProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionState | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(event.checkedInCount ?? 0);
  const [checkInOpen, setCheckInOpen] = useState(event.checkInStatus === "open");
  const [attendees, setAttendees] = useState<EventCheckIn[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualUid, setManualUid] = useState("");

  const refreshAttendees = useCallback(async () => {
    try {
      const res = await authedFetch(
        `/api/events/${event.id}/check-in/attendees`
      );
      if (!res.ok) return;
      const data = (await res.json()) as { attendees?: EventCheckIn[] };
      setAttendees(data.attendees ?? []);
      setCheckedInCount(data.attendees?.length ?? checkedInCount);
    } catch {
      /* ignore */
    }
  }, [event.id, checkedInCount]);

  useEffect(() => {
    if (checkInOpen) void refreshAttendees();
  }, [checkInOpen, refreshAttendees]);

  async function openSession(rotate = false) {
    setBusy(rotate ? "rotate" : "open");
    setError(null);
    try {
      const res = await authedFetch(`/api/events/${event.id}/check-in/open`, {
        method: "POST",
      });
      const data = (await res.json()) as SessionState & {
        error?: string;
        message?: string;
        checkedInCount?: number;
      };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Failed");
        return;
      }
      setSession({
        token: data.token,
        expiresAt: data.expiresAt,
        checkInUrl: data.checkInUrl,
      });
      setCheckInOpen(true);
      if (typeof data.checkedInCount === "number") {
        setCheckedInCount(data.checkedInCount);
      }
    } catch {
      setError(t.community.saveError);
    } finally {
      setBusy(null);
    }
  }

  async function closeSession() {
    setBusy("close");
    setError(null);
    try {
      const res = await authedFetch(`/api/events/${event.id}/check-in/close`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? "Failed");
        return;
      }
      setSession(null);
      setCheckInOpen(false);
    } catch {
      setError("Failed");
    } finally {
      setBusy(null);
    }
  }

  async function removeAttendee(userId: string) {
    setBusy(`remove-${userId}`);
    try {
      await authedFetch(`/api/events/${event.id}/check-in/remove`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      await refreshAttendees();
    } finally {
      setBusy(null);
    }
  }

  async function manualCheckIn() {
    const uid = manualUid.trim();
    if (!uid) return;
    setBusy("manual");
    try {
      await authedFetch(`/api/events/${event.id}/check-in/manual`, {
        method: "POST",
        body: JSON.stringify({ userId: uid }),
      });
      setManualUid("");
      await refreshAttendees();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#F8FAFC]">
            {t.checkIn.eventCheckIn}
          </h2>
          <p className="text-sm text-[#64748B]">
            {event.title} · {club.name}
          </p>
        </div>
        <Link
          href={`/events/${event.slug ?? event.id}`}
          className="text-xs text-[#3B82F6] hover:underline"
        >
          {t.community.viewPublicClub}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.community.going} value={event.goingCount ?? 0} />
        <Stat label={t.community.interested} value={event.interestedCount ?? 0} />
        <Stat label={t.checkIn.checkedIn} value={checkedInCount} />
      </div>

      <div className="flex flex-wrap gap-2">
        {!checkInOpen ? (
          <Button
            type="button"
            disabled={!!busy || !user}
            className="border border-[#22C55E]/40 bg-[#22C55E]/15 text-[#F8FAFC]"
            onClick={() => void openSession(false)}
          >
            {busy === "open" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {t.checkIn.startCheckIn}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!!busy}
            variant="outline"
            className="border-red-500/40 text-red-200"
            onClick={() => void closeSession()}
          >
            {busy === "close" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {t.checkIn.closeCheckIn}
          </Button>
        )}
      </div>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      {session && checkInOpen ? (
        <EventCheckInQrPanel
          checkInUrl={session.checkInUrl}
          expiresAt={session.expiresAt}
          rotating={busy === "rotate"}
          onRotate={() => void openSession(true)}
        />
      ) : null}

      <section className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-3">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">
          {t.checkIn.checkedInAttendees}
        </h3>
        {attendees.length === 0 ? (
          <p className="mt-2 text-sm text-[#64748B]">—</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {attendees.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#151B24]/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#F8FAFC]">
                    {a.displayNameSnapshot ?? a.userId}
                  </p>
                  <p className="text-[10px] text-[#64748B]">
                    {new Date(a.checkedInAt).toLocaleString()} · {a.method}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy === `remove-${a.userId}`}
                  className="border-white/[0.08] text-[#CBD5E1]"
                  onClick={() => void removeAttendee(a.userId)}
                >
                  <UserMinus className="size-3.5" />
                  {t.checkIn.removeCheckIn}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-3">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">
          {t.checkIn.manualCheckIn}
        </h3>
        <p className="mt-1 text-[10px] text-[#64748B]">
          Firebase Auth UID of signed-in member
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            value={manualUid}
            onChange={(e) => setManualUid(e.target.value)}
            placeholder="uid"
            className="h-9 min-w-[200px] flex-1 rounded-lg border border-white/[0.08] bg-[#151B24] px-3 text-sm text-[#F8FAFC]"
          />
          <Button
            type="button"
            disabled={!checkInOpen || busy === "manual"}
            onClick={() => void manualCheckIn()}
            className="border border-[#3B82F6]/40 bg-[#3B82F6]/15"
          >
            {busy === "manual" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t.checkIn.manualCheckIn
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#151B24]/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
        {label}
      </p>
      <p className="font-heading text-xl font-bold text-[#F8FAFC]">{value}</p>
    </div>
  );
}
