"use client";

import { MapPin, Sparkles, Wrench } from "lucide-react";

import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";

export function AuthBrandHero({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();

  const bullets = [
    { icon: MapPin, text: t.auth.bulletClubs },
    { icon: Sparkles, text: t.auth.bulletBuilds },
    { icon: Wrench, text: t.auth.bulletSubmit },
  ];

  return (
    <div className={compact ? "space-y-4" : "space-y-6 lg:space-y-8"}>
      <ShiftItLogo variant="hero" priority className="mx-auto lg:mx-0" />
      <div className="text-center lg:text-left">
        <p className="font-heading text-xl font-bold tracking-wide text-[#F8FAFC] sm:text-2xl">
          {brand.tagline}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#94A3B8]">
          {t.auth.loginSubcopy}
        </p>
      </div>
      {!compact ? (
        <ul className="hidden space-y-3 sm:block">
          {bullets.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#0B1118]/50 px-3 py-2.5 text-sm text-[#CBD5E1]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#EF4444]/20 to-[#3B82F6]/20 text-[#F8FAFC]">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
