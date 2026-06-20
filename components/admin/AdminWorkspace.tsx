"use client";

import { useState } from "react";

import { AdminClubsPanel } from "@/components/admin/AdminClubsPanel";
import { CommunityModerationPanel } from "@/components/admin/CommunityModerationPanel";
import { AdminEventsPanel } from "@/components/admin/AdminEventsPanel";
import { AdminImportsPanel } from "@/components/admin/AdminImportsPanel";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import { AdminOverviewPanel } from "@/components/admin/AdminOverviewPanel";
import { SubmissionReviewPanel } from "@/components/admin/SubmissionReviewPanel";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

type AdminTab =
  | "overview"
  | "clubs"
  | "members"
  | "events"
  | "imports"
  | "submissions"
  | "moderation";

type AdminWorkspaceProps = {
  initialSubmissions: Submission[];
  pendingCount: number;
};

export function AdminWorkspace({
  initialSubmissions,
  pendingCount,
}: AdminWorkspaceProps) {
  const { t } = useLocale();
  const [tab, setTab] = useState<AdminTab>("overview");

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "overview", label: t.admin.tabOverview },
    { id: "clubs", label: t.admin.tabClubs },
    { id: "members", label: t.admin.tabMembersCars },
    { id: "events", label: t.admin.tabEvents },
    { id: "imports", label: t.admin.tabImports },
    { id: "submissions", label: t.admin.tabSubmissions, badge: pendingCount },
    { id: "moderation", label: t.admin.tabModeration },
  ];

  return (
    <>
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition sm:px-4",
              tab === item.id
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {item.label}
            {item.badge != null && item.badge > 0 ? (
              <span className="rounded-full bg-[#F97316]/20 px-1.5 text-[10px] text-[#F97316]">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <AdminOverviewPanel pendingCount={pendingCount} />
      ) : tab === "clubs" ? (
        <AdminClubsPanel />
      ) : tab === "members" ? (
        <AdminMembersPanel />
      ) : tab === "events" ? (
        <AdminEventsPanel />
      ) : tab === "imports" ? (
        <AdminImportsPanel />
      ) : tab === "moderation" ? (
        <CommunityModerationPanel />
      ) : (
        <SubmissionReviewPanel initialSubmissions={initialSubmissions} />
      )}
    </>
  );
}
