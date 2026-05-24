"use client";

import { useCallback, useState } from "react";

import { ClubAboutSection } from "@/components/clubs/ClubAboutSection";
import { ClubAdminTools } from "@/components/clubs/ClubAdminTools";
import { ClubEventsSection } from "@/components/clubs/ClubEventsSection";
import { ClubLocationPanel } from "@/components/clubs/ClubLocationPanel";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";
import { ClubNearbyShopsSection } from "@/components/clubs/ClubNearbyShopsSection";
import { ClubProfileHero } from "@/components/clubs/ClubProfileHero";
import { ClubSocialPanel } from "@/components/clubs/ClubSocialPanel";
import { ClubStatsPanel } from "@/components/clubs/ClubStatsPanel";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import type { CarEvent, CarShop, Club, ClubMember, CommunityZone } from "@/lib/types";

type ClubDetailViewProps = {
  club: Club;
  members: ClubMember[];
  events: CarEvent[];
  shops: CarShop[];
  zones?: CommunityZone[];
};

export function ClubDetailView({
  club: initialClub,
  members,
  events,
  shops,
  zones = [],
}: ClubDetailViewProps) {
  const [club, setClub] = useState(initialClub);
  const [heroCoverSrc, setHeroCoverSrc] = useState<string | undefined>(() =>
    clubCoverUrl(initialClub)
  );

  const handleCoverSaved = useCallback((bustedUrl: string) => {
    const base = bustedUrl.split("?")[0] ?? bustedUrl;
    setHeroCoverSrc(bustedUrl);
    setClub((prev) => ({
      ...prev,
      coverImageUrl: base,
      imageUrl: base,
    }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-0 sm:px-1">
      <ClubProfileHero
        club={club}
        memberCount={members.length}
        coverSrc={heroCoverSrc}
      />

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
          <ClubAboutSection club={club} />
          <ClubMembersSection club={club} members={members} />
          <div className="grid gap-3 sm:grid-cols-2">
            <ClubEventsSection club={club} events={events} />
            <ClubNearbyShopsSection club={club} shops={shops} />
          </div>
          {zones.length > 0 ? (
            <RelatedSection title="Club areas">
              <RelatedEntityList
                items={zones.map((zone) => ({
                  href: "/map",
                  title: zone.name,
                  subtitle: zone.description,
                }))}
              />
            </RelatedSection>
          ) : null}
        </div>

        <aside className="flex flex-col gap-2">
          <ClubStatsPanel club={club} memberCount={members.length} />
          <ClubSocialPanel club={club} />
          <ClubLocationPanel club={club} />
          <ClubAdminTools
            club={club}
            coverSrc={heroCoverSrc}
            onClubUpdate={setClub}
            onCoverSaved={handleCoverSaved}
          />
        </aside>
      </div>
    </div>
  );
}
