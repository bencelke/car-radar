"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Car,
  ChevronDown,
  Heart,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { LanguageDropdown } from "@/components/language/LanguageDropdown";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserTitleBadge } from "@/components/profile/UserTitleBadge";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getAdminNavLabelKey, isAdminUser } from "@/lib/auth/permissions";
import { displayNameFromUserLike } from "@/lib/auth/user-display";
import { ROUTES } from "@/lib/config/routes";
import { isNavItemActive } from "@/lib/navigation/is-nav-active";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  className?: string;
};

export function ProfileMenu({ className }: ProfileMenuProps) {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const displayName = displayNameFromUserLike(profile, user);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const adminNavKey = getAdminNavLabelKey(profile);

  if (!user) return null;

  const close = () => setOpen(false);

  const menuLinks = [
    { href: ROUTES.profile, label: t.profile.profile, icon: User },
    { href: ROUTES.garage, label: t.profile.myGarage, icon: Car },
    { href: ROUTES.events, label: t.nav.myEvents, icon: Activity },
    { href: ROUTES.following, label: t.social.followingBuilds, icon: Heart },
    { href: ROUTES.notifications, label: t.notifications.notifications, icon: Bell },
  ];

  return (
    <div ref={panelRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t.profile.profileAndSettings}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex min-h-11 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-gradient-to-br from-[#3B82F6]/25 to-[#A855F7]/20 pl-1 pr-2 text-[#CBD5E1] transition hover:text-[#F8FAFC] md:min-h-9",
          open && "border-[#3B82F6]/40"
        )}
      >
        <UserAvatar profile={profile} authUser={user} size="sm" rounded="md" />
        <ChevronDown
          className={cn(
            "hidden size-3.5 text-[#64748B] transition sm:block",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1118]/95 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.06] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-[#F8FAFC]">
                {displayName}
              </p>
              <UserTitleBadge profile={profile} />
            </div>
            <p className="mt-1 truncate text-xs text-[#64748B]">{user.email}</p>
          </div>

          <nav className="flex flex-col gap-0.5 p-2">
            {menuLinks.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  role="menuitem"
                  onClick={close}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm transition",
                    active
                      ? "bg-[#EF4444]/10 text-[#F8FAFC]"
                      : "text-[#CBD5E1] hover:bg-white/[0.04] hover:text-[#F8FAFC]"
                  )}
                >
                  <Icon className="size-4 shrink-0 text-[#64748B]" />
                  {item.label}
                </Link>
              );
            })}

            {isAdminUser(profile) ? (
              <Link
                href={ROUTES.admin}
                role="menuitem"
                onClick={close}
                className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm text-[#FCA5A5] transition hover:bg-[#EF4444]/10"
              >
                <Shield className="size-4 shrink-0" />
                {t.profile[adminNavKey]}
              </Link>
            ) : null}
          </nav>

          <div className="border-t border-white/[0.06] p-2">
            <LanguageDropdown variant="menu" onSelect={close} />
            <button
              type="button"
              role="menuitem"
              className="mt-1 flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-[#94A3B8] transition hover:bg-red-500/10 hover:text-red-200"
              onClick={() => {
                close();
                void signOut();
              }}
            >
              <LogOut className="size-4 shrink-0" />
              {t.auth.signOut}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
