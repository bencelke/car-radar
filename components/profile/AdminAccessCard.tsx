"use client";

import Link from "next/link";
import {
  Calendar,
  Car,
  ClipboardList,
  Shield,
  Users,
} from "lucide-react";

import { FirebaseDiagnosticsPanel } from "@/components/admin/FirebaseDiagnosticsPanel";
import {
  premiumPanelClass,
  sectionHeadingClass,
  sectionSubtextClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

export function AdminAccessCard() {
  const { t } = useLocale();

  const links = [
    {       href: brand.nav.admin.href,
      label: t.profile.manageClubs,
      icon: Car,
    },
    {
      href: brand.nav.admin.href,
      label: t.profile.manageMembers,
      icon: Users,
    },
    {
      href: brand.nav.admin.href,
      label: t.profile.manageEvents,
      icon: Calendar,
    },
    {
      href: brand.nav.admin.href,
      label: t.profile.reviewSubmissions,
      icon: ClipboardList,
    },
  ];

  return (
    <section
      className={cn(
        premiumPanelClass,
        "border-[#EF4444]/20 p-5",
        "shadow-[0_0_32px_-16px_rgba(239,68,68,0.35)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#EF4444]/35 bg-[#EF4444]/15 text-[#FCA5A5]">
          <Shield className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={sectionHeadingClass}>{t.profile.adminAccess}</h2>
          <p className={sectionSubtextClass}>{t.profile.adminAccessHint}</p>
        </div>
      </div>

      <Link
        href={brand.nav.admin.href}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#EF4444]/45 bg-gradient-to-r from-[#EF4444]/30 to-[#A855F7]/20 text-sm font-semibold text-[#F8FAFC] shadow-[0_0_24px_-10px_rgba(239,68,68,0.5)] transition hover:from-[#EF4444]/40"
      >
        {t.profile.openAdminDashboard}
      </Link>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex min-h-10 items-center gap-2 rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-3 text-xs text-[#CBD5E1] transition hover:border-white/[0.1] hover:text-[#F8FAFC]"
              >
                <Icon className="size-3.5 shrink-0 text-[#64748B]" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {process.env.NODE_ENV === "development" ? (
        <details className="mt-4 rounded-lg border border-white/[0.06] bg-[#151B24]/30 px-3 py-2">
          <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            DEV · Firebase diagnostics
          </summary>
          <div className="mt-2 -mx-1">
            <FirebaseDiagnosticsPanel />
          </div>
        </details>
      ) : null}
    </section>
  );
}
