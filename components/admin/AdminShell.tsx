"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";
import { brand } from "@/lib/config/brand";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export function AdminSidebarNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLocale();

  const groups: NavGroup[] = [
    {
      id: "overview",
      label: t.admin.navOverview,
      items: [{ href: ADMIN_ROUTES.overview, label: t.admin.navOverview }],
    },
    {
      id: "growth",
      label: t.admin.navGrowth,
      items: [
        { href: ADMIN_ROUTES.invitations, label: t.admin.navInvitations },
        { href: ADMIN_ROUTES.claims, label: t.admin.navClaims },
        { href: ADMIN_ROUTES.submissions, label: t.admin.navSubmissions },
      ],
    },
    {
      id: "community",
      label: t.admin.navCommunity,
      items: [
        { href: ADMIN_ROUTES.clubs, label: t.admin.navClubs },
        { href: ADMIN_ROUTES.members, label: t.admin.navMembersGarages },
        { href: ADMIN_ROUTES.users, label: t.admin.navUsers },
        { href: ADMIN_ROUTES.events, label: t.admin.navEvents },
      ],
    },
    {
      id: "business",
      label: t.admin.navBusiness,
      items: [
        { href: ADMIN_ROUTES.shops, label: t.admin.navShopsVendors },
        { href: ADMIN_ROUTES.advertising, label: t.admin.navAdvertising },
      ],
    },
    {
      id: "safety",
      label: t.admin.navSafety,
      items: [{ href: ADMIN_ROUTES.reports, label: t.admin.navReports }],
    },
    {
      id: "system",
      label: t.admin.navSystem,
      items: [
        { href: ADMIN_ROUTES.content, label: t.admin.navContent },
        { href: ADMIN_ROUTES.settings, label: t.admin.navSettings },
        { href: ADMIN_ROUTES.diagnostics, label: t.admin.navDiagnostics },
      ],
    },
  ];

  function isActive(href: string) {
    if (href === ADMIN_ROUTES.overview) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className={cn("flex flex-col gap-4", className)} aria-label="Admin">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive(item.href)
                      ? "bg-gradient-to-r from-[#3B82F6]/20 to-[#A855F7]/10 text-[#F8FAFC]"
                      : "text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#CBD5E1]"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link
        href={ROUTES.home}
        onClick={onNavigate}
        className="mt-2 px-3 text-xs text-[#64748B] hover:text-[#CBD5E1]"
      >
        ← {brand.appName}
      </Link>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#05070A]">
      <div className="mx-auto flex max-w-[1920px]">
        <aside className="hidden w-56 shrink-0 border-r border-white/[0.06] bg-[#0B1118]/40 p-4 lg:block xl:w-60">
          <AdminHeader
            title={t.admin.founderConsoleTitle}
            subtitle={t.admin.controlCenterSubtitle}
          />
          <AdminSidebarNav className="mt-6" />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0B1118]/60 px-4 py-3 lg:hidden">
            <AdminHeader
              title={t.admin.founderConsoleTitle}
              subtitle={t.admin.controlCenterSubtitle}
              compact
            />
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="rounded-lg border border-white/[0.08] p-2 text-[#CBD5E1]"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {mobileOpen ? (
            <div className="border-b border-white/[0.06] bg-[#0B1118]/95 p-4 lg:hidden">
              <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          ) : null}

          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
