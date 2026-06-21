"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type HomeSceneHeroProps = {
  className?: string;
};

export function HomeSceneHero({ className }: HomeSceneHeroProps) {
  const { t } = useLocale();
  const { user } = useAuth();

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute -left-6 top-0 size-32 rounded-full bg-[#EF4444]/10 blur-3xl sm:size-40" />
      <div className="pointer-events-none absolute -right-4 bottom-0 size-24 rounded-full bg-[#3B82F6]/10 blur-3xl sm:size-32" />

      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#EF4444]/80">
        {t.home.heroTagline}
      </p>

      <h1 className="mt-2 font-heading text-[1.65rem] font-bold leading-[1.15] tracking-tight text-[#F8FAFC] sm:mt-3 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
        {t.home.heroHeading}
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#94A3B8] sm:mt-4 sm:text-base">
        {t.home.heroSubheading}
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap">
        <Link
          href="/map"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_32px_-8px_rgba(239,68,68,0.55)] transition hover:brightness-110"
        >
          <MapPin className="size-4 shrink-0" />
          {t.home.openMap}
          <ArrowRight className="size-4 shrink-0 opacity-80" />
        </Link>

        {user ? (
          <>
            <Link
              href="/garage"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[#151B24]/80 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] backdrop-blur-sm transition hover:border-[#3B82F6]/35"
            >
              {t.home.createGarage}
            </Link>
            <Link
              href="/submit?type=event"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0B1118]/60 px-5 py-2.5 text-sm font-medium text-[#CBD5E1] transition hover:border-white/[0.14] hover:text-[#F8FAFC] sm:border-white/[0.12] sm:bg-[#151B24]/80"
            >
              {t.home.submitMeet}
            </Link>
          </>
        ) : (
          <Link
            href="/submit?type=event"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[#151B24]/80 px-5 py-2.5 text-sm font-medium text-[#F8FAFC] backdrop-blur-sm transition hover:border-[#3B82F6]/35"
          >
            {t.home.submitMeet}
          </Link>
        )}
      </div>

      {!user ? (
        <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
          {t.home.guestBrowseHint}
        </p>
      ) : (
        <p className="mt-3">
          <Link
            href="/profile"
            className="text-xs font-medium text-[#93C5FD] hover:underline"
          >
            {t.home.goToProfile}
          </Link>
        </p>
      )}
    </div>
  );
}
