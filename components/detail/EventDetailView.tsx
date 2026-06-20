"use client";

import { useEffect, useState } from "react";

import { CorrectionLink } from "@/components/detail/CorrectionLink";
import { DetailHero } from "@/components/detail/DetailHero";
import { DirectionsButton } from "@/components/detail/DirectionsButton";
import { InfoGrid } from "@/components/detail/InfoGrid";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { EventAttendanceSummary } from "@/components/events/EventAttendanceSummary";
import { EventCheckInStatus } from "@/components/events/EventCheckInStatus";
import { EventConversationTabs } from "@/components/events/EventConversationTabs";
import { EventRsvpControl } from "@/components/events/EventRsvpControl";
import { DetailShareBar } from "@/components/share/DetailShareBar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getUserEventCheckIn } from "@/lib/repositories/event-checkins";
import type { CarEvent, CarShop, Club } from "@/lib/types";
import { clubDetailPath, shopDetailPath } from "@/lib/utils/entity-paths";

type EventDetailViewProps = {
  event: CarEvent;
  relatedShops: CarShop[];
  relatedClubs: Club[];
  hostClub?: Club | null;
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

export function EventDetailView({
  event,
  relatedShops,
  relatedClubs,
  hostClub = null,
}: EventDetailViewProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [goingCount, setGoingCount] = useState(event.goingCount ?? 0);
  const [interestedCount, setInterestedCount] = useState(
    event.interestedCount ?? 0
  );
  const [userCheckedInAt, setUserCheckedInAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserCheckedInAt(null);
      return;
    }
    void getUserEventCheckIn(event.id, user.uid).then((checkIn) => {
      setUserCheckedInAt(checkIn?.checkedInAt ?? null);
    });
  }, [user, event.id]);
  const location = [event.address, event.city, event.country]
    .filter(Boolean)
    .join(" · ");

  const socialLinks: SocialLinkItem[] = [];
  if (event.organizerInstagram) {
    socialLinks.push({
      href: event.organizerInstagram,
      label: t.detail.visitInstagram,
      kind: "instagram",
    });
  }
  if (event.sourceUrl) {
    socialLinks.push({
      href: event.sourceUrl,
      label: t.detail.visitWebsite,
      kind: "source",
    });
  }

  return (
    <div className="space-y-6">
      <DetailShareBar
        entity={{ type: "event", event }}
        inviteOptions={{
          joinShiftIt: true,
          eventInvite: { eventId: event.id },
        }}
      />
      <DetailHero
        title={event.title}
        typeBadge={event.type}
        verified={event.verified}
        verifiedLabel={t.map.verified}
        location={location}
        gradientClassName="from-purple-600/40 via-[#111827] to-orange-600/30"
      >
        <EventAttendanceSummary
          event={event}
          goingCount={goingCount}
          interestedCount={interestedCount}
        />
        <EventCheckInStatus
          event={event}
          userCheckedInAt={userCheckedInAt}
          className="mt-1"
        />
        {event.description ? (
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            {event.description}
          </p>
        ) : null}
      </DetailHero>

      <EventConversationTabs
        event={event}
        club={hostClub}
        details={
          <>
            <InfoGrid
              items={[
                { label: "Date", value: formatEventTime(event.startTime) },
                {
                  label: "End",
                  value: event.endTime ? formatEventTime(event.endTime) : null,
                },
                { label: "Organizer", value: event.organizerName },
                {
                  label: t.community.meetingRoute,
                  value: event.meetingRoute ?? null,
                },
              ]}
            />

            <EventRsvpControl
              event={event}
              onCountsChange={() => {
                void import("@/lib/repositories/events").then(({ getEventById }) =>
                  getEventById(event.id).then((fresh) => {
                    if (fresh) {
                      setGoingCount(fresh.goingCount ?? 0);
                      setInterestedCount(fresh.interestedCount ?? 0);
                    }
                  })
                );
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {event.lat != null && event.lng != null ? (
                <DirectionsButton
                  lat={event.lat}
                  lng={event.lng}
                  label={t.detail.directions}
                />
              ) : null}
              <SocialLinks title={t.detail.socialLinks} links={socialLinks} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <RelatedSection title={t.detail.nearbyShops}>
                <RelatedEntityList
                  items={relatedShops.slice(0, 6).map((shop) => ({
                    href: shopDetailPath(shop),
                    title: shop.name,
                    subtitle: `${shop.city}`,
                  }))}
                />
              </RelatedSection>
              <RelatedSection title={t.detail.relatedClubs}>
                <RelatedEntityList
                  items={relatedClubs.slice(0, 6).map((club) => ({
                    href: clubDetailPath(club),
                    title: club.name,
                    subtitle: `${club.type} · ${club.city}`,
                  }))}
                />
              </RelatedSection>
            </div>

            <CorrectionLink
              targetType="event"
              targetName={event.title}
              entityId={event.id}
            />
          </>
        }
      />
    </div>
  );
}
