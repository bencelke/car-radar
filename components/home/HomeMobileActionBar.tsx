"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Map, Plus } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { ROUTES, submitRoute } from "@/lib/config/routes";
import { isNavItemActive } from "@/lib/navigation/is-nav-active";
import { cn } from "@/lib/utils";

const actions = [
  { href: ROUTES.home, labelKey: "mobileActionHome" as const, icon: Home, navKey: ROUTES.home },
  { href: ROUTES.map, labelKey: "mobileActionMap" as const, icon: Map, navKey: ROUTES.map },
  {
    href: ROUTES.events,
    labelKey: "mobileActionEvents" as const,
    icon: Calendar,
    navKey: ROUTES.events,
  },
  {
    href: submitRoute(),
    labelKey: "mobileActionSubmit" as const,
    icon: Plus,
    navKey: ROUTES.submit,
  },
];

export function HomeMobileActionBar() {
  const { t } = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t.home.mobileActionBarLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#05070a]/95 backdrop-blur-xl lg:hidden",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {actions.map(({ href, labelKey, icon: Icon, navKey }) => {
          const active = isNavItemActive(pathname, navKey);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition",
                active ? "text-[#F8FAFC]" : "text-[#94A3B8] active:text-[#F8FAFC]"
              )}
            >
              <Icon className={cn("size-5 shrink-0", active && "text-[#EF4444]")} />
              <span>{t.home[labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
