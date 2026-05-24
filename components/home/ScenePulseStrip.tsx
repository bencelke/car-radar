"use client";

import { Calendar, Car, Store, Users } from "lucide-react";
import Link from "next/link";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type PulseCard = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
};

type ScenePulseStripProps = {
  weekendCount: number;
  newShopCount: number;
  featuredClubCount: number;
  activeMemberCount: number;
  onThisWeekend?: () => void;
  onNewShops?: () => void;
  onFeaturedClubs?: () => void;
  onActiveMembers?: () => void;
  className?: string;
};

function PulseCardButton({
  card,
}: {
  card: PulseCard;
}) {
  const inner = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#94A3B8]">
        {card.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {card.label}
        </span>
        <span className="mt-0.5 block font-heading text-sm font-bold text-[#F8FAFC]">
          {card.value}
        </span>
        {card.hint ? (
          <span className="mt-0.5 block truncate text-[10px] text-[#94A3B8]">
            {card.hint}
          </span>
        ) : null}
      </span>
    </>
  );

  const className = cn(
    "flex min-w-[140px] flex-1 items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0B1118]/60 px-3 py-2.5 text-left transition",
    "hover:border-white/[0.12] hover:bg-[#151B24]/80 hover:shadow-[0_0_24px_-8px_rgba(59,130,246,0.35)]"
  );

  if (card.onClick) {
    return (
      <button type="button" onClick={card.onClick} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={card.href} className={className}>
      {inner}
    </Link>
  );
}

export function ScenePulseStrip({
  weekendCount,
  newShopCount,
  featuredClubCount,
  activeMemberCount,
  onThisWeekend,
  onNewShops,
  onFeaturedClubs,
  onActiveMembers,
  className,
}: ScenePulseStripProps) {
  const { t } = useLocale();

  const cards: PulseCard[] = [
    {
      id: "weekend",
      label: t.home.thisWeekend,
      value: String(weekendCount),
      hint: weekendCount > 0 ? t.nav.events : undefined,
      icon: <Calendar className="size-4 text-purple-400" />,
      href: "/events",
      onClick: onThisWeekend,
    },
    {
      id: "shops",
      label: t.home.newShops,
      value: String(newShopCount),
      icon: <Store className="size-4 text-orange-400" />,
      href: "/shops",
      onClick: onNewShops,
    },
    {
      id: "clubs",
      label: t.home.featuredClubs,
      value: String(featuredClubCount),
      icon: <Users className="size-4 text-blue-400" />,
      href: "/clubs",
      onClick: onFeaturedClubs,
    },
    {
      id: "members",
      label: t.home.activeMembers,
      value: String(activeMemberCount),
      icon: <Car className="size-4 text-sky-400" />,
      href: "/members",
      onClick: onActiveMembers,
    },
  ];

  return (
    <GlassPanel
      elevated
      className={cn(
        "border-white/10 bg-[#05070a]/80 shadow-[0_12px_48px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EF4444]/90">
          {t.home.scenePulse}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto p-2 scrollbar-thin">
        {cards.map((card) => (
          <PulseCardButton key={card.id} card={card} />
        ))}
      </div>
    </GlassPanel>
  );
}
