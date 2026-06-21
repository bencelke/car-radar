"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { List, Map as MapIcon, Plus } from "lucide-react";

import { EventCard } from "@/components/cards/EventCard";
import { EmptyStateCard } from "@/components/layout/EmptyStateCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { ROUTES, submitRoute } from "@/lib/config/routes";
import { DEFAULT_CENTER } from "@/lib/map/map-config";
import { calculateDistanceKm, resolveCityCoordinates } from "@/lib/map/map-utils";
import { getFollowedClubIds } from "@/lib/repositories/club-follows";
import type { CarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type DateFilterId = "all" | "today" | "weekend" | "7d" | "30d";

type MeetFinderClientProps = {
  events: CarEvent[];
};

export function MeetFinderClient({ events }: MeetFinderClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "map">("list");
  const [dateFilter, setDateFilter] = useState<DateFilterId>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [followedOnly, setFollowedOnly] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFollowedIds([]);
      return;
    }
    void getFollowedClubIds(user.uid).then(setFollowedIds);
  }, [user]);

  const center = useMemo(
    () => (cityFilter ? resolveCityCoordinates(cityFilter) : DEFAULT_CENTER),
    [cityFilter]
  );

  const filtered = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    return events.filter((event) => {
      if (event.status !== "approved") return false;
      const start = new Date(event.startTime);
      if (Number.isNaN(start.getTime())) return false;

      if (followedOnly && event.clubId && !followedIds.includes(event.clubId)) {
        return false;
      }
      if (
        cityFilter &&
        !event.city.toLowerCase().includes(cityFilter.toLowerCase())
      ) {
        return false;
      }

      switch (dateFilter) {
        case "today":
          return start >= startOfToday && start < endOfToday;
        case "weekend": {
          const day = start.getDay();
          const diff = start.getTime() - now.getTime();
          return diff >= 0 && diff <= 7 * 86400000 && (day === 0 || day === 6);
        }
        case "7d":
          return start.getTime() - now.getTime() <= 7 * 86400000 && start >= now;
        case "30d":
          return (
            start.getTime() - now.getTime() <= 30 * 86400000 && start >= now
          );
        default:
          return start >= now;
      }
    });
  }, [events, dateFilter, cityFilter, followedOnly, followedIds]);

  const withDistance = useMemo(
    () =>
      filtered
        .map((event) => {
          const coords =
            event.lat != null && event.lng != null
              ? { lat: event.lat, lng: event.lng }
              : resolveCityCoordinates(event.city, event.area);
          return {
            event,
            distanceKm: calculateDistanceKm(
              center.lat,
              center.lng,
              coords.lat,
              coords.lng
            ),
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [filtered, center]
  );

  const openEventsMap = () => {
    router.push(`${ROUTES.map}?layer=events`);
  };

  const dateFilters: { id: DateFilterId; label: string }[] = [
    { id: "today", label: t.community.today },
    { id: "weekend", label: t.community.thisWeekend },
    { id: "7d", label: t.community.next7Days },
    { id: "30d", label: t.community.next30Days },
    { id: "all", label: t.map.filterAll },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
            {t.community.meetFinder}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
            {t.community.meetFinderSubtitle}
          </p>
          {withDistance.length > 0 ? (
            <p className="mt-2 text-xs text-[#64748B]">
              {withDistance.length} {t.community.upcomingEvents.toLowerCase()}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href={submitRoute("event")} />}
            size="sm"
            className="min-h-11 border border-[#EF4444]/50 bg-[#EF4444]/20 px-4 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(239,68,68,0.45)] hover:bg-[#EF4444]/30"
          >
            <Plus className="mr-1.5 size-4" />
            {t.home.submitMeet}
          </Button>
          <div
            className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-1"
            role="tablist"
            aria-label={t.community.meetFinder}
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              onClick={() => setView("list")}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium sm:text-sm",
                view === "list"
                  ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                  : "text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              <List className="size-4 shrink-0" />
              {t.community.listView}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              onClick={openEventsMap}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium sm:text-sm",
                "text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              <MapIcon className="size-4 shrink-0" />
              {t.community.mapView}
            </button>
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dateFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setDateFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium sm:text-sm",
              "min-h-11",
              dateFilter === f.id
                ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC]"
                : "border-white/[0.08] text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {f.label}
          </button>
        ))}
        <input
          type="search"
          placeholder={t.community.cityFilter}
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="min-h-11 min-w-[9rem] shrink-0 rounded-full border border-white/[0.08] bg-[#0B1118] px-4 text-sm text-[#F8FAFC] placeholder:text-[#64748B]"
        />
        {user ? (
          <button
            type="button"
            onClick={() => setFollowedOnly((v) => !v)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium sm:text-sm",
              "min-h-11",
              followedOnly
                ? "border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
                : "border-white/[0.08] text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {t.community.followedClubs}
          </button>
        ) : null}
      </div>

      {withDistance.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withDistance.map(({ event, distanceKm }) => (
            <div key={event.id} className="flex h-full flex-col">
              <EventCard event={event} className="flex-1" />
              <p className="mt-1.5 px-1 text-[10px] text-[#64748B]">
                {distanceKm.toFixed(1)} km · {t.community.distance}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={List}
          title={t.community.noEventsFound}
          actions={[
            {
              label: t.home.submitMeet,
              href: submitRoute("event"),
              variant: "primary",
            },
            {
              label: t.community.mapView,
              href: `${ROUTES.map}?layer=events`,
              variant: "secondary",
            },
          ]}
        />
      )}
    </div>
  );
}
