"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminClubsPanel } from "@/components/admin/AdminClubsPanel";
import { CommunityModerationPanel } from "@/components/admin/CommunityModerationPanel";
import { AdminEventsPanel } from "@/components/admin/AdminEventsPanel";
import { AdminImportsPanel } from "@/components/admin/AdminImportsPanel";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import { AdminOverviewPanel } from "@/components/admin/AdminOverviewPanel";
import {
  AdminClaimsPanel,
  AdminDiagnosticsPanel,
  AdminShopsPanel,
} from "@/components/admin/AdminSectionPanels";
import {
  AdminSidebar,
  parseAdminSection,
  type AdminSection,
} from "@/components/admin/AdminSidebar";
import { SubmissionReviewPanel } from "@/components/admin/SubmissionReviewPanel";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Submission } from "@/lib/types";

type AdminWorkspaceProps = {
  initialSubmissions: Submission[];
  pendingCount: number;
};

function AdminWorkspaceInner({
  initialSubmissions,
  pendingCount,
}: AdminWorkspaceProps) {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<AdminSection>(() =>
    parseAdminSection(searchParams.get("section"))
  );

  useEffect(() => {
    setTab(parseAdminSection(searchParams.get("section")));
  }, [searchParams]);

  const sidebarItems: { id: AdminSection; label: string; badge?: number }[] = [
    { id: "overview", label: t.admin.tabOverview },
    { id: "clubs", label: t.admin.tabClubs },
    { id: "members", label: t.admin.tabMembersCars },
    { id: "events", label: t.admin.tabEvents },
    { id: "shops", label: t.admin.tabShops },
    { id: "imports", label: t.admin.tabImports },
    { id: "submissions", label: t.admin.tabSubmissions, badge: pendingCount },
    { id: "claims", label: t.admin.tabClaims },
    { id: "moderation", label: t.admin.tabModeration },
    { id: "diagnostics", label: t.admin.tabDiagnostics },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6">
      <AdminSidebar items={sidebarItems} active={tab} onSelect={setTab} />

      <div className="min-w-0">
        {tab === "overview" ? (
          <AdminOverviewPanel pendingCount={pendingCount} />
        ) : tab === "clubs" ? (
          <AdminClubsPanel />
        ) : tab === "members" ? (
          <AdminMembersPanel />
        ) : tab === "events" ? (
          <AdminEventsPanel />
        ) : tab === "shops" ? (
          <AdminShopsPanel />
        ) : tab === "imports" ? (
          <AdminImportsPanel />
        ) : tab === "claims" ? (
          <AdminClaimsPanel />
        ) : tab === "moderation" ? (
          <CommunityModerationPanel />
        ) : tab === "diagnostics" ? (
          <AdminDiagnosticsPanel />
        ) : (
          <SubmissionReviewPanel initialSubmissions={initialSubmissions} />
        )}
      </div>
    </div>
  );
}

export function AdminWorkspace(props: AdminWorkspaceProps) {
  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-xl border border-white/[0.06] bg-[#151B24]/40" />
      }
    >
      <AdminWorkspaceInner {...props} />
    </Suspense>
  );
}
