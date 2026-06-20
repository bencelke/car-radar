"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ClubAboutSection } from "@/components/clubs/ClubAboutSection";
import { ClubAnnouncements } from "@/components/clubs/ClubAnnouncements";
import { ClubEventsSection } from "@/components/clubs/ClubEventsSection";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";
import { ClubNearbyShopsSection } from "@/components/clubs/ClubNearbyShopsSection";
import { ClubPostsPanel } from "@/components/community/ClubPostsPanel";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { useLocale } from "@/components/providers/LocaleProvider";
import type {
  CarEvent,
  CarShop,
  Club,
  ClubAnnouncement,
  ClubMember,
  CommunityZone,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type ClubTab = "overview" | "members" | "events" | "posts" | "announcements";

const TAB_IDS: ClubTab[] = [
  "overview",
  "members",
  "events",
  "posts",
  "announcements",
];

type ClubDetailTabsProps = {
  club: Club;
  members: ClubMember[];
  events: CarEvent[];
  shops: CarShop[];
  zones?: CommunityZone[];
  announcements?: ClubAnnouncement[];
  followerCount?: number;
  coverSrc?: string;
  onClubUpdate: (club: Club) => void;
  onCoverSaved: (url: string) => void;
};

export function parseClubTabParam(value: string | null): ClubTab {
  if (value && TAB_IDS.includes(value as ClubTab)) {
    return value as ClubTab;
  }
  return "overview";
}

export function ClubDetailTabs({
  club,
  members,
  events,
  shops,
  zones = [],
  announcements = [],
  followerCount = 0,
  coverSrc,
  onClubUpdate,
  onCoverSaved,
}: ClubDetailTabsProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseClubTabParam(searchParams.get("tab"));

  const tabs: { id: ClubTab; label: string }[] = [
    { id: "overview", label: t.community.overview },
    { id: "members", label: t.members.title },
    { id: "events", label: t.nav.events },
    { id: "posts", label: t.communityPosts.posts },
    { id: "announcements", label: t.community.announcements },
  ];

  function selectTab(id: ClubTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", id);
    }
    const query = params.toString();
    router.replace(query ? `/clubs/${club.slug}?${query}` : `/clubs/${club.slug}`, {
      scroll: false,
    });
  }

  return (
    <div className="space-y-3">
      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm",
              activeTab === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? <ClubAboutSection club={club} /> : null}
      {activeTab === "members" ? (
        <ClubMembersSection club={club} members={members} />
      ) : null}
      {activeTab === "events" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <ClubEventsSection club={club} events={events} />
          <ClubNearbyShopsSection club={club} shops={shops} />
        </div>
      ) : null}
      {activeTab === "posts" ? (
        <ClubPostsPanel
          club={club}
          members={members}
          events={events}
          followerCount={followerCount}
          coverSrc={coverSrc}
          onClubUpdate={onClubUpdate}
          onCoverSaved={onCoverSaved}
        />
      ) : null}
      {activeTab === "announcements" ? (
        <ClubAnnouncements announcements={announcements} />
      ) : null}

      {activeTab === "overview" && zones.length > 0 ? (
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
  );
}
