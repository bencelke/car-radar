"use client";

import Link from "next/link";
import { AlertTriangle, Megaphone, Route, Sparkles, XCircle } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubAnnouncement } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<
  ClubAnnouncement["type"],
  { icon: typeof Megaphone; className: string }
> = {
  meet: {
    icon: Megaphone,
    className: "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]",
  },
  route_change: {
    icon: Route,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  },
  cancellation: {
    icon: XCircle,
    className: "border-red-500/40 bg-red-500/10 text-red-200",
  },
  sponsor: {
    icon: Sparkles,
    className: "border-[#A855F7]/40 bg-[#A855F7]/10 text-[#E9D5FF]",
  },
  club_news: {
    icon: Megaphone,
    className: "border-white/10 bg-white/5 text-[#CBD5E1]",
  },
  general: {
    icon: AlertTriangle,
    className: "border-white/10 bg-white/5 text-[#94A3B8]",
  },
};

type ClubAnnouncementCardProps = {
  announcement: ClubAnnouncement;
  eventHref?: string;
};

export function ClubAnnouncementCard({
  announcement,
  eventHref,
}: ClubAnnouncementCardProps) {
  const { t } = useLocale();
  const style = TYPE_STYLES[announcement.type];
  const Icon = style.icon;
  const typeLabel = t.community.announcementTypes[announcement.type];
  const date = announcement.publishedAt ?? announcement.createdAt;
  const formatted = new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "rounded-xl border p-3 backdrop-blur-sm",
        announcement.type === "cancellation"
          ? "border-red-500/25 bg-red-950/20"
          : announcement.type === "route_change"
            ? "border-amber-500/20 bg-amber-950/10"
            : "border-white/[0.08] bg-[#0B1118]/60"
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            style.className
          )}
        >
          <Icon className="size-3" />
          {typeLabel}
        </span>
        <time className="text-[10px] text-[#64748B]">{formatted}</time>
      </div>
      <h3 className="font-heading text-sm font-semibold text-[#F8FAFC]">
        {announcement.title}
      </h3>
      <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-[#94A3B8]">
        {announcement.body}
      </p>
      {eventHref ? (
        <Link
          href={eventHref}
          className="mt-2 inline-block text-xs text-[#3B82F6] hover:underline"
        >
          {t.community.viewRelatedEvent}
        </Link>
      ) : null}
    </article>
  );
}
