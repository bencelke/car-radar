"use client";

import { useEffect, useMemo, useState } from "react";
import { List, Map as MapIcon } from "lucide-react";

import { EventCard } from "@/components/cards/EventCard";
import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import { CarRadarMap } from "@/components/map/CarRadarMap";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { eventsToMapItems } from "@/lib/data/map-items";
import { DEFAULT_CENTER, getMapboxToken } from "@/lib/map/map-config";
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
  const { user } = useAuth();
  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const [view, setView] = useState<"list" | "map">("list");
  const [dateFilter, setDateFilter] = useState<DateFilterId>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [followedOnly, setFollowedOnly] = useState(false);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const mapItems = useMemo(
    () => eventsToMapItems(withDistance.map((x) => x.event)),
    [withDistance]
  );

  const dateFilters: { id: DateFilterId; label: string }[] = [
    { id: "today", label: t.community.today },
    { id: "weekend", label: t.community.thisWeekend },
    { id: "7d", label: t.community.next7Days },
    { id: "30d", label: t.community.next30Days },
    { id: "all", label: t.map.filterAll },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
            {t.community.meetFinder}
          </h1>
          <p className="text-sm text-[#64748B]">
            {withDistance.length} {t.community.upcomingEvents.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/[0.08] bg-[#0B1118]/60 p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium",
              view === "list"
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B]"
            )}
          >
            <List className="size-3.5" />
            {t.community.listView}
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium",
              view === "map"
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B]"
            )}
          >
            <MapIcon className="size-3.5" />
            {t.community.mapView}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {dateFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setDateFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              dateFilter === f.id
                ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC]"
                : "border-white/[0.08] text-[#64748B]"
            )}
          >
            {f.label}
          </button>
        ))}
        <input
          type="text"
          placeholder={t.community.cityFilter}
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="h-8 rounded-full border border-white/[0.08] bg-[#0B1118] px-3 text-xs text-[#F8FAFC]"
        />
        {user ? (
          <button
            type="button"
            onClick={() => setFollowedOnly((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              followedOnly
                ? "border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
                : "border-white/[0.08] text-[#64748B]"
            )}
          >
            {t.community.followedClubs}
          </button>
        ) : null}
      </div>

      {view === "map" ? (
        <div className="h-[min(420px,55vh)] overflow-hidden rounded-xl border border-white/[0.08]">
          {!mapboxToken ? (
            <MockMapPanel mapPins={[]} selectedPinId={null} onPinSelect={() => {}} />
          ) : (
            <CarRadarMap
              variant="dashboard"
              accessToken={mapboxToken}
              items={mapItems}
              selectedId={selectedId}
              onSelectItem={(item) => setSelectedId(item.id)}
              heightClassName="h-full min-h-[320px]"
              showCustomControls
              enableInteraction
            />
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withDistance.map(({ event, distanceKm }) => (
            <div key={event.id}>
              <EventCard event={event} />
              <p className="mt-1 text-[10px] text-[#64748B]">
                {distanceKm.toFixed(1)} km · {t.community.distance}
              </p>
            </div>
          ))}
        </div>
      )}

      {withDistance.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">
          {t.community.noEventsMatch}
        </p>
      ) : null}
    </div>
  );
}
