"use client";

import Link from "next/link";
import { useState } from "react";

import { ClubAnnouncementEditor } from "@/components/clubs/ClubAnnouncementEditor";
import { EventForm, type EventFormValues } from "@/components/events/EventForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { canManageClub } from "@/lib/clubs/club-auth";
import {
  archiveClubAnnouncement,
  createClubAnnouncement,
} from "@/lib/repositories/club-announcements";
import {
  cancelClubEvent,
  createClubEvent,
  updateClubEvent,
} from "@/lib/repositories/events";
import type { CarEvent, Club, ClubAnnouncement, ClubMember } from "@/lib/types";
import { clubDetailPath, memberDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type TabId = "overview" | "announcements" | "events" | "members";

type ClubDashboardProps = {
  club: Club;
  members: ClubMember[];
  initialAnnouncements: ClubAnnouncement[];
  initialEvents: CarEvent[];
  initialFollowerCount: number;
};

export function ClubDashboard({
  club,
  members,
  initialAnnouncements,
  initialEvents,
  initialFollowerCount,
}: ClubDashboardProps) {
  const { t } = useLocale();
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [events, setEvents] = useState(initialEvents);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [showAnnEditor, setShowAnnEditor] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CarEvent | null>(null);

  const canManage = canManageClub(club, user?.uid, isAdmin);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t.community.overview },
    { id: "announcements", label: t.community.announcements },
    { id: "events", label: t.community.upcomingEvents },
    { id: "members", label: t.nav.clubs },
  ];

  if (!canManage) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {t.community.manageAccessRequired}
        </p>
      </div>
    );
  }

  async function handleCreateAnnouncement(input: {
    title: string;
    body: string;
    type: ClubAnnouncement["type"];
  }) {
    if (!user) return;
    const created = await createClubAnnouncement({
      clubId: club.id,
      authorUid: user.uid,
      authorDisplayName: user.displayName ?? user.email ?? undefined,
      ...input,
      status: "published",
    });
    setAnnouncements((prev) => [created, ...prev]);
    setShowAnnEditor(false);
  }

  async function handleEventSubmit(values: EventFormValues) {
    if (!user) return;
    const payload = {
      clubId: club.id,
      clubName: club.name,
      title: values.title,
      type: values.type,
      city: values.city,
      country: values.country,
      area: values.area || undefined,
      address: values.address,
      description: values.description,
      startTime: new Date(values.startTime).toISOString(),
      endTime: values.endTime ? new Date(values.endTime).toISOString() : undefined,
      meetingRoute: values.meetingRoute || undefined,
      maxAttendance: values.maxAttendance ? Number(values.maxAttendance) : undefined,
      organizerName: values.organizerName || undefined,
      organizerInstagram: values.organizerInstagram || undefined,
      lat: values.lat ? Number(values.lat) : undefined,
      lng: values.lng ? Number(values.lng) : undefined,
      createdByUid: user.uid,
    };

    if (editingEvent) {
      const updated = await updateClubEvent(editingEvent.id, payload);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const created = await createClubEvent(payload);
      setEvents((prev) => [created, ...prev]);
    }
    setShowEventForm(false);
    setEditingEvent(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            {t.community.clubDashboard}
          </p>
          <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
            {club.name}
          </h1>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={clubDetailPath(club)} />}
          variant="outline"
          size="sm"
          className="border-white/[0.08] text-[#CBD5E1]"
        >
          {t.community.viewPublicClub}
        </Button>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              tab === id
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: t.community.followers, value: followerCount },
            { label: "Members", value: members.length },
            { label: t.community.upcomingEvents, value: events.filter((e) => e.status === "approved").length },
            { label: t.community.announcements, value: announcements.filter((a) => a.status === "published").length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-4"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                {stat.label}
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-[#F8FAFC]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "announcements" ? (
        <div className="space-y-3">
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAnnEditor((v) => !v)}
            className="border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
          >
            {t.community.createAnnouncement}
          </Button>
          {showAnnEditor ? (
            <ClubAnnouncementEditor
              onSubmit={handleCreateAnnouncement}
              onCancel={() => setShowAnnEditor(false)}
            />
          ) : null}
          <ul className="space-y-2">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/[0.08] bg-[#0B1118]/50 p-3"
              >
                <p className="font-medium text-[#F8FAFC]">{a.title}</p>
                <p className="mt-1 text-xs text-[#64748B]">{a.status}</p>
                {a.status !== "archived" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      void archiveClubAnnouncement(a.id).then(() =>
                        setAnnouncements((prev) =>
                          prev.map((x) =>
                            x.id === a.id ? { ...x, status: "archived" } : x
                          )
                        )
                      )
                    }
                  >
                    Archive
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "events" ? (
        <div className="space-y-3">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingEvent(null);
              setShowEventForm((v) => !v);
            }}
            className="border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
          >
            {t.community.createEvent}
          </Button>
          {showEventForm ? (
            <EventForm
              club={club}
              initial={editingEvent ?? undefined}
              onSubmit={handleEventSubmit}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
            />
          ) : null}
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-white/[0.08] bg-[#0B1118]/50 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[#F8FAFC]">{event.title}</p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(event.startTime).toLocaleString()} · {event.status}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                      <span className="rounded-md border border-[#22C55E]/30 bg-[#22C55E]/10 px-2 py-0.5 text-[#86EFAC]">
                        {(event.goingCount ?? 0).toLocaleString()} {t.community.going}
                      </span>
                      <span className="rounded-md border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[#93C5FD]">
                        {(event.interestedCount ?? 0).toLocaleString()}{" "}
                        {t.community.interested}
                      </span>
                      {(event.checkInStatus === "open" ||
                        (event.checkedInCount ?? 0) > 0) && (
                        <span className="rounded-md border border-[#A855F7]/30 bg-[#A855F7]/10 px-2 py-0.5 text-[#E9D5FF]">
                          {(event.checkedInCount ?? 0).toLocaleString()}{" "}
                          {t.checkIn.checkedIn}
                        </span>
                      )}
                      {event.checkInStatus === "open" ? (
                        <span className="rounded-md border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 font-semibold uppercase tracking-wide text-[#86EFAC]">
                          {t.checkIn.checkInOpen}
                        </span>
                      ) : event.checkInStatus === "closed" ? (
                        <span className="rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 uppercase tracking-wide text-[#94A3B8]">
                          {t.checkIn.checkInClosed}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/clubs/${club.slug}/manage/events/${event.id}`} />
                      }
                      size="sm"
                      className="border border-[#22C55E]/40 bg-[#22C55E]/15 text-[#F8FAFC]"
                    >
                      {t.checkIn.manageCheckIn}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(event);
                        setShowEventForm(true);
                      }}
                    >
                      {t.community.editEvent}
                    </Button>
                    {event.status !== "cancelled" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void cancelClubEvent(event.id).then((updated) =>
                            setEvents((prev) =>
                              prev.map((e) => (e.id === updated.id ? updated : e))
                            )
                          )
                        }
                      >
                        {t.community.cancelEvent}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "members" ? (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id}>
              <Link
                href={memberDetailPath(member)}
                className="block rounded-lg border border-white/[0.06] bg-[#0B1118]/50 px-3 py-2 text-sm text-[#CBD5E1] hover:border-white/[0.12]"
              >
                {member.displayName}
                {member.carName ? ` · ${member.carName}` : ""}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
