"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Car,
  Compass,
  Heart,
  Home,
} from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import {
  MOBILE_BOTTOM_NAV_ITEMS,
  type MobileBottomNavKey,
} from "@/lib/navigation/mobile-bottom-nav";
import { isNavItemActive } from "@/lib/navigation/is-nav-active";
import { cn } from "@/lib/utils";

const navIcons: Record<MobileBottomNavKey, typeof Home> = {
  home: Home,
  map: Compass,
  events: Activity,
  shops: Car,
  clubs: Heart,
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      data-mobile-bottom-nav
      aria-label={t.mobile.primaryNav}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#05070A]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid h-[var(--mobile-bottom-nav-height)] max-w-lg grid-cols-5 px-1">
        {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = navIcons[item.key];
          const active = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-semibold transition",
                active
                  ? "text-[#F8FAFC]"
                  : "text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active && "text-[#ff3b1f] drop-shadow-[0_0_10px_rgba(255,59,31,0.45)]"
                )}
                aria-hidden
              />
              <span className="max-w-full truncate leading-none">
                {t.nav[item.key]}
              </span>
              {active ? (
                <span
                  className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff3b1f] to-[#f97316]"
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
