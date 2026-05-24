"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ClubImportWizard } from "@/components/admin/ClubImportWizard";
import { CsvImportPanel } from "@/components/admin/CsvImportPanel";
import { FirestoreDataPanel } from "@/components/admin/FirestoreDataPanel";
import { SubmissionReviewPanel } from "@/components/admin/SubmissionReviewPanel";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

type AdminTab = "review" | "import" | "clubImport" | "firestore";

type AdminWorkspaceProps = {
  initialSubmissions: Submission[];
  pendingCount: number;
};

export function AdminWorkspace({
  initialSubmissions,
  pendingCount,
}: AdminWorkspaceProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("review");

  const tabs: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "review", label: t.admin.tabReview, badge: pendingCount },
    { id: "import", label: t.admin.tabImport },
    { id: "clubImport", label: t.admin.tabClubImport },
    { id: "firestore", label: t.admin.tabFirestoreData },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition",
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

      {tab === "review" ? (
        <SubmissionReviewPanel initialSubmissions={initialSubmissions} />
      ) : tab === "import" ? (
        <CsvImportPanel onImported={() => router.refresh()} />
      ) : tab === "clubImport" ? (
        <ClubImportWizard />
      ) : (
        <FirestoreDataPanel />
      )}
    </>
  );
}
