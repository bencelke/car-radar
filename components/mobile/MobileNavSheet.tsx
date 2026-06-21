"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Car,
  Compass,
  Heart,
  Home,
  Settings,
  Shield,
} from "lucide-react";

import { LanguageDropdown } from "@/components/language/LanguageDropdown";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getAdminNavLabelKey, isAdminUser } from "@/lib/auth/permissions";
import {
  PUBLIC_NAV_ITEMS,
  ROUTES,
  submitRoute,
} from "@/lib/config/routes";
import { isNavItemActive } from "@/lib/navigation/is-nav-active";
import { cn } from "@/lib/utils";

type MobileNavSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const discoverIcons: Record<string, typeof Home> = {
  home: Home,
  map: Compass,
  events: Activity,
  shops: Car,
  clubs: Heart,
};

const accountLinks = [
  { href: ROUTES.garage, labelKey: "myGarage" as const, icon: Car },
  { href: ROUTES.feed, labelKey: "viewActivity" as const, icon: Activity },
  { href: ROUTES.following, labelKey: "followingBuilds" as const, icon: Heart },
  { href: ROUTES.notifications, labelKey: "notifications" as const, icon: Bell },
  {
    href: ROUTES.profile,
    labelKey: "profileAndSettings" as const,
    icon: Settings,
  },
] as const;

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, loading, profile } = useAuth();
  const adminNavKey = getAdminNavLabelKey(profile);

  const close = () => onOpenChange(false);

  const linkClass = (href: string) => {
    const active = isNavItemActive(pathname, href);
    return cn(
      "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition",
      active
        ? "border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#F8FAFC]"
        : "text-[#CBD5E1] hover:bg-white/[0.04] hover:text-[#F8FAFC]"
    );
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      title={t.mobile.menu}
      closeLabel={t.mobile.closeMenu}
      showHandle={false}
      panelClassName="pb-[env(safe-area-inset-bottom)]"
    >
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          {t.nav.discoverSection}
        </p>
        {PUBLIC_NAV_ITEMS.map((item) => {
          const Icon = discoverIcons[item.key] ?? Compass;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={close}
              className={linkClass(item.href)}
            >
              <Icon className="size-4 shrink-0 text-[#64748B]" />
              {t.nav[item.key]}
            </Link>
          );
        })}

        <Link
          href={ROUTES.members}
          onClick={close}
          className={linkClass(ROUTES.members)}
        >
          {t.members.title}
        </Link>

        <Link
          href={submitRoute()}
          onClick={close}
          className={cn(
            linkClass(submitRoute()),
            "mt-1 border border-[#EF4444]/35 bg-[#EF4444]/10 font-semibold text-[#F8FAFC]"
          )}
        >
          {t.nav.submit}
        </Link>

        {!loading && !user ? (
          <>
            <div className="my-2 h-px bg-white/[0.06]" />
            <Link
              href={ROUTES.login}
              onClick={close}
              className={linkClass(ROUTES.login)}
            >
              {t.auth.login}
            </Link>
          </>
        ) : null}

        {!loading && user ? (
          <>
            <div className="my-3 h-px bg-white/[0.06]" />
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {t.nav.myShiftItSection}
            </p>
            {accountLinks.map((item) => {
              const Icon = item.icon;
              const label =
                item.labelKey === "followingBuilds"
                  ? t.social.followingBuilds
                  : item.labelKey === "notifications"
                    ? t.notifications.notifications
                    : t.profile[item.labelKey];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={linkClass(item.href)}
                >
                  <Icon className="size-4 shrink-0 text-[#64748B]" />
                  {label}
                </Link>
              );
            })}
            {isAdminUser(profile) ? (
              <>
                <div className="my-2 h-px bg-white/[0.06]" />
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {t.nav.founderSection}
                </p>
                <Link
                  href={ROUTES.admin}
                  onClick={close}
                  className={linkClass(ROUTES.admin)}
                >
                  <Shield className="size-4 shrink-0 text-[#FCA5A5]" />
                  {t.profile[adminNavKey]}
                </Link>
              </>
            ) : null}
          </>
        ) : null}

        <div className="my-3 h-px bg-white/[0.06]" />

        <div className="px-1">
          <LanguageDropdown variant="menu" onSelect={close} />
        </div>
      </nav>
    </ResponsiveSheet>
  );
}
