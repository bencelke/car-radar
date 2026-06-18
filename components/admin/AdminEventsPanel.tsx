"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { EventForm, type EventFormValues } from "@/components/events/EventForm";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { getClubsForAdmin, getEventsForAdmin } from "@/lib/repositories/admin-data";
import {
  cancelClubEvent,
  createClubEvent,
  updateClubEvent,
} from "@/lib/repositories/events";
import type { CarEvent, Club } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";

export function AdminEventsPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [selected, setSelected] = useState<CarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clubList, eventList] = await Promise.all([
      getClubsForAdmin(),
      getEventsForAdmin(),
    ]);
    setClubs(clubList.filter((c) => c.status === "approved"));
    setEvents(eventList);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
    void getClubsForAdmin().then((list) => {
      if (list[0]) setClubId((prev) => prev || list[0].id);
    });
  }, [loadData]);

  if (blocked) return <AdminGuardFallback />;

  const actor = user ? { uid: user.uid } : null;
  const canWrite = isFirebaseConfigured && Boolean(actor);
  const club = clubs.find((c) => c.id === clubId);

  async function handleSubmit(values: EventFormValues) {
    if (!actor || !club) return;
    setMessage(null);
    const patch = {
      clubId: club.id,
      clubName: club.name,
      title: values.title,
      type: values.type,
      city: values.city,
      country: values.country,
      area: values.area || undefined,
      address: values.address || undefined,
      lat: values.lat ? Number(values.lat) : undefined,
      lng: values.lng ? Number(values.lng) : undefined,
      description: values.description,
      startTime: new Date(values.startTime).toISOString(),
      endTime: values.endTime ? new Date(values.endTime).toISOString() : undefined,
      meetingRoute: values.meetingRoute || undefined,
      maxAttendance: values.maxAttendance
        ? Number(values.maxAttendance)
        : undefined,
      organizerName: values.organizerName || undefined,
      organizerInstagram: values.organizerInstagram || undefined,
      createdByUid: actor.uid,
      status: "approved" as const,
    };

    if (selected) {
      await updateClubEvent(selected.id, patch);
      setMessage(t.admin.eventUpdated);
    } else {
      const created = await createClubEvent(patch);
      setSelected(created);
      setMessage(t.admin.eventCreated);
    }
    await loadData();
  }

  async function handleCancel() {
    if (!selected) return;
    await cancelClubEvent(selected.id);
    setMessage(t.admin.eventCancelled);
    setSelected(null);
    await loadData();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <GlassPanel>
        <PanelHeader title={t.admin.eventsListTitle} />
        <div className="max-h-[420px] space-y-1 overflow-y-auto p-3 pt-0">
          {loading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-[#64748B]" />
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelected(event)}
                className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.03]"
              >
                <span className="truncate text-[#F8FAFC]">{event.title}</span>
                <span className="truncate text-[10px] text-[#64748B]">
                  {event.status} · {event.city}
                </span>
              </button>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeader title={selected ? t.admin.editEvent : t.admin.addEvent} />
        <div className="space-y-3 p-4 pt-0">
          {!canWrite ? (
            <p className="text-sm text-amber-200/90">{t.admin.firestoreNotConfigured}</p>
          ) : null}

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]">
              {t.admin.selectClub}
            </label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="h-9 w-full max-w-md rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {club ? (
            <EventForm
              club={club}
              initial={selected ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => setSelected(null)}
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            {selected ? (
              <>
                <Link
                  href={eventDetailPath(selected)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs text-[#CBD5E1]"
                >
                  <ExternalLink className="size-3.5" />
                  {t.admin.viewPublicEvent}
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 border-red-500/30 text-red-200"
                  onClick={() => void handleCancel()}
                >
                  {t.admin.cancelEvent}
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-white/[0.08]"
              onClick={() => setSelected(null)}
            >
              {t.admin.addEvent}
            </Button>
          </div>

          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        </div>
      </GlassPanel>
    </div>
  );
}
