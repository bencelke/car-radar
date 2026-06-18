"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Car,
  Heart,
  Settings,
  Shield,
} from "lucide-react";

import { LanguageDropdown } from "@/components/language/LanguageDropdown";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

type MobileNavSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const primaryLinks = [
  { key: "map" as const, href: "/map" },
  { key: "events" as const, href: "/events" },
  { key: "shops" as const, href: "/shops" },
  { key: "clubs" as const, href: "/clubs" },
];

const accountLinks = [
  { href: "/garage", labelKey: "myGarage" as const, icon: Car },
  { href: "/feed", labelKey: "viewActivity" as const, icon: Activity },
  { href: "/following", labelKey: "followingBuilds" as const, icon: Heart },
  { href: "/notifications", labelKey: "notifications" as const, icon: Bell },
  {
    href: brand.nav.profile.href,
    labelKey: "profileAndSettings" as const,
    icon: Settings,
  },
] as const;

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, loading, isAdmin } = useAuth();

  const navLabels = {
    map: t.nav.map,
    events: t.nav.events,
    shops: t.nav.shops,
    clubs: t.nav.clubs,
  };

  const close = () => onOpenChange(false);

  const linkClass = (href: string, activeMatch?: boolean) => {
    const active =
      activeMatch ??
      (href === "/map"
        ? pathname === "/" || pathname === "/map"
        : pathname === href || pathname.startsWith(`${href}/`));

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
        {primaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={linkClass(item.href)}
          >
            {navLabels[item.key]}
          </Link>
        ))}

        <Link href="/members" onClick={close} className={linkClass("/members")}>
          {t.members.title}
        </Link>

        <Link
          href={brand.nav.submit.href}
          onClick={close}
          className={linkClass(brand.nav.submit.href)}
        >
          {t.nav.submit}
        </Link>

        {!loading && !user ? (
          <>
            <div className="my-2 h-px bg-white/[0.06]" />
            <Link
              href={brand.nav.login.href}
              onClick={close}
              className={linkClass(brand.nav.login.href)}
            >
              {t.auth.login}
            </Link>
          </>
        ) : null}

        {!loading && user ? (
          <>
            <div className="my-3 h-px bg-white/[0.06]" />
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {t.profile.account}
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
            {isAdmin ? (
              <Link
                href={brand.nav.admin.href}
                onClick={close}
                className={linkClass(brand.nav.admin.href)}
              >
                <Shield className="size-4 shrink-0 text-[#FCA5A5]" />
                {t.profile.adminAccess}
              </Link>
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
