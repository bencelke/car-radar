"use client";

import Link from "next/link";
import { Calendar, Shield } from "lucide-react";

import { AdminManageClubLink } from "@/components/admin/AdminManageLinks";
import { ClubFollowButton } from "@/components/clubs/ClubFollowButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CarEvent, Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubPostsRailProps = {
  club: Club;
  followerCount: number;
  memberCount: number;
  postCount: number;
  events: CarEvent[];
  returnPath: string;
  coverSrc?: string;
  onClubUpdate: (club: Club) => void;
  onCoverSaved: (url: string) => void;
  className?: string;
};

export function ClubPostsRail({
  club,
  followerCount,
  memberCount,
  postCount,
  events,
  returnPath,
  coverSrc,
  onClubUpdate,
  onCoverSaved,
  className,
}: ClubPostsRailProps) {
  const { t } = useLocale();
  const { isAdmin } = useAuth();

  const upcoming = events
    .filter((e) => e.startTime && new Date(e.startTime) >= new Date())
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
    .slice(0, 2);

  return (
    <aside className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          {t.communityPosts.community}
        </h3>
        <div className="mt-3">
          <ClubFollowButton
            clubId={club.id}
            clubSlug={club.slug}
            initialFollowerCount={followerCount}
            returnPath={returnPath}
          />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-2 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-[#64748B]">
              {t.community.followers}
            </dt>
            <dd className="text-sm font-semibold text-[#F8FAFC]">
              {followerCount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-2 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-[#64748B]">
              {t.communityPosts.posts}
            </dt>
            <dd className="text-sm font-semibold text-[#F8FAFC]">
              {postCount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-2 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-[#64748B]">
              {t.members.title}
            </dt>
            <dd className="text-sm font-semibold text-[#F8FAFC]">
              {memberCount.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-2 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-[#64748B]">
              {t.nav.events}
            </dt>
            <dd className="text-sm font-semibold text-[#F8FAFC]">
              {upcoming.length > 0 ? upcoming.length : events.length}
            </dd>
          </div>
        </dl>
        {club.description ? (
          <p className="mt-4 line-clamp-4 text-xs leading-relaxed text-[#94A3B8]">
            {club.description}
          </p>
        ) : null}
      </div>

      {upcoming.length > 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <Calendar className="size-3.5" />
            {t.communityPosts.upcomingEvents}
          </h3>
          <ul className="mt-3 space-y-2">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug ?? event.id}`}
                  className="block rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-3 py-2 transition hover:border-[#3B82F6]/30"
                >
                  <p className="text-sm font-medium text-[#F8FAFC] line-clamp-1">
                    {event.title}
                  </p>
                  {event.startTime ? (
                    <p className="mt-0.5 text-[10px] text-[#64748B]">
                      {new Date(event.startTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-4">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          <Shield className="size-3.5" />
          {t.communityPosts.postingRules}
        </h3>
        <ul className="mt-3 space-y-1.5 text-xs text-[#94A3B8]">
          <li>{t.communityPosts.ruleRespectful}</li>
          <li>{t.communityPosts.ruleRelevant}</li>
          <li>{t.communityPosts.ruleNoSpam}</li>
          <li>{t.communityPosts.ruleReportUnsafe}</li>
        </ul>
      </div>

      {isAdmin ? (
        <AdminManageClubLink clubId={club.id} className="w-full" />
      ) : null}
    </aside>
  );
}
