"use client";

import { useCallback, useState } from "react";

import { ClubAboutSection } from "@/components/clubs/ClubAboutSection";
import { ClubAdminTools } from "@/components/clubs/ClubAdminTools";
import { ClubAnnouncements } from "@/components/clubs/ClubAnnouncements";
import { ClubEventsSection } from "@/components/clubs/ClubEventsSection";
import { ClubFollowButton } from "@/components/clubs/ClubFollowButton";
import { ClubLocationPanel } from "@/components/clubs/ClubLocationPanel";
import { ClubManageLink } from "@/components/clubs/ClubManageGate";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";
import { ClubNearbyShopsSection } from "@/components/clubs/ClubNearbyShopsSection";
import { ClubProfileHero } from "@/components/clubs/ClubProfileHero";
import { ClubSocialPanel } from "@/components/clubs/ClubSocialPanel";
import { DetailShareBar } from "@/components/share/DetailShareBar";
import { ClubStatsPanel } from "@/components/clubs/ClubStatsPanel";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import type { CarEvent, CarShop, Club, ClubAnnouncement, ClubMember, CommunityZone } from "@/lib/types";

type ClubDetailViewProps = {
  club: Club;
  members: ClubMember[];
  events: CarEvent[];
  shops: CarShop[];
  zones?: CommunityZone[];
  announcements?: ClubAnnouncement[];
  followerCount?: number;
};

export function ClubDetailView({
  club: initialClub,
  members,
  events,
  shops,
  zones = [],
  announcements = [],
  followerCount = 0,
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

      <DetailShareBar
        entity={{ type: "club", club, followerCount }}
        inviteOptions={{
          joinShiftIt: true,
          joinClub: { clubId: club.id },
        }}
      />

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <aside className="order-1 flex flex-col gap-2 lg:order-2">
          <ClubFollowButton
            clubId={club.id}
            clubSlug={club.slug}
            initialFollowerCount={followerCount}
          />
          <ClubManageLink
            club={club}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-3 text-xs font-semibold text-[#CBD5E1] hover:border-[#EF4444]/30 hover:text-[#F8FAFC]"
          />
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

        <div className="order-2 flex min-w-0 flex-col gap-3 lg:order-1 lg:col-span-2">
          <ClubAboutSection club={club} />
          <ClubAnnouncements announcements={announcements} />
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
      </div>
    </div>
  );
}
