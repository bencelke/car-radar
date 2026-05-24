"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Shield, User } from "lucide-react";

import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

const navHrefs = [
  { key: "map" as const, href: "/map" },
  { key: "events" as const, href: "/events" },
  { key: "shops" as const, href: "/shops" },
  { key: "clubs" as const, href: "/clubs" },
];

export function TopNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, loading, isAdmin } = useAuth();

  const navLabels = {
    map: t.nav.map,
    events: t.nav.events,
    shops: t.nav.shops,
    clubs: t.nav.clubs,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05070A]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 lg:h-[4.25rem] lg:gap-4 lg:px-6">
        <Link
          href="/"
          className="group flex min-w-0 max-w-[42%] shrink-0 items-center sm:max-w-none"
          aria-label={brand.appName}
        >
          <ShiftItLogo
            variant="nav"
            className="transition-[filter,opacity] duration-200 ease-out group-hover:opacity-95 group-hover:brightness-110 group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,0.22)]"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navHrefs.map((item) => {
            const active =
              item.href === "/map"
                ? pathname === "/" || pathname === "/map"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`) ||
                  (item.href === "/clubs" && pathname === "/communities");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {navLabels[item.key]}
                {active ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F97316]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LocaleToggle />
          <Button
            nativeButton={false}
            render={<Link href={brand.nav.submit.href} />}
            size="sm"
            className="hidden h-8 border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(239,68,68,0.5)] hover:bg-[#EF4444]/30 sm:inline-flex"
          >
            {t.nav.submit}
          </Button>
          <button
            type="button"
            aria-label="Notifications"
            className="hidden size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B1118] text-[#64748B] transition hover:border-white/[0.12] hover:text-[#CBD5E1] sm:flex"
          >
            <Bell className="size-4" />
          </button>

          {!loading && !user ? (
            <Button
              nativeButton={false}
              render={<Link href={brand.nav.login.href} />}
              size="sm"
              variant="outline"
              className="h-8 border-white/[0.12] bg-[#0B1118]/80 text-[#CBD5E1] hover:border-[#3B82F6]/40 hover:text-[#F8FAFC]"
            >
              {t.auth.login}
            </Button>
          ) : null}

          {!loading && user ? (
            <>
              {isAdmin ? (
                <Link
                  href={brand.nav.admin.href}
                  className="hidden h-8 items-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-2.5 text-xs font-medium text-[#F8FAFC] transition hover:bg-[#EF4444]/20 sm:inline-flex"
                >
                  <Shield className="size-3.5" />
                  {t.nav.admin}
                </Link>
              ) : null}
              <Link
                href={brand.nav.profile.href}
                aria-label={t.nav.profile}
                className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-[#3B82F6]/30 to-[#A855F7]/30 text-[#CBD5E1] hover:text-[#F8FAFC]"
              >
                <User className="size-4" />
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
