"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { MobileNavSheet } from "@/components/mobile/MobileNavSheet";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV_ITEMS, ROUTES, submitRoute } from "@/lib/config/routes";
import { isNavItemActive } from "@/lib/navigation/is-nav-active";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        data-mobile-header
        className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05070A]/92 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:h-[3.75rem] lg:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.mobile.menu}
              aria-expanded={menuOpen}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B1118]/80 text-[#CBD5E1] transition hover:text-[#F8FAFC] md:hidden"
            >
              <Menu className="size-5" />
            </button>

            <Link
              href={ROUTES.home}
              className="group flex min-w-0 max-w-[min(42vw,160px)] shrink-0 cursor-pointer items-center sm:max-w-none md:max-w-none"
              aria-label={t.nav.goToHome}
            >
              <ShiftItLogo
                variant="nav"
                className="transition-[filter,opacity] duration-200 ease-out group-hover:opacity-95 group-hover:brightness-110 group-hover:drop-shadow-[0_0_14px_rgba(239,68,68,0.22)]"
              />
            </Link>
          </div>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label={t.nav.primaryNav}
          >
            {PUBLIC_NAV_ITEMS.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-[#F8FAFC]"
                      : "text-[#64748B] hover:text-[#CBD5E1]"
                  )}
                >
                  {t.nav[item.key]}
                  {active ? (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F97316] shadow-[0_0_12px_rgba(239,68,68,0.45)]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button
              nativeButton={false}
              render={<Link href={submitRoute()} />}
              size="sm"
              className="hidden h-9 min-w-[4.5rem] border border-[#EF4444]/50 bg-[#EF4444]/20 px-3 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(239,68,68,0.5)] hover:bg-[#EF4444]/30 sm:inline-flex"
            >
              {t.nav.submit}
            </Button>
            <NotificationBell />

            {!loading && !user ? (
              <Button
                nativeButton={false}
                render={<Link href={ROUTES.login} />}
                size="sm"
                variant="outline"
                className="hidden h-9 border-white/[0.12] bg-[#0B1118]/80 text-[#CBD5E1] hover:border-[#3B82F6]/40 hover:text-[#F8FAFC] sm:inline-flex"
              >
                {t.auth.login}
              </Button>
            ) : null}

            {!loading && user ? <ProfileMenu /> : null}
          </div>
        </div>
      </header>

      <MobileNavSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
