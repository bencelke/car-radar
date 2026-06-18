"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ClubImportWizard } from "@/components/admin/ClubImportWizard";
import { CsvImportPanel } from "@/components/admin/CsvImportPanel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type ImportTab = "club" | "csv";

export function AdminImportsPanel() {
  const { t } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<ImportTab>("club");

  const tabs: { id: ImportTab; label: string }[] = [
    { id: "club", label: t.admin.tabClubImport },
    { id: "csv", label: t.admin.tabImport },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition sm:px-4",
              tab === item.id
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "club" ? (
        <ClubImportWizard />
      ) : (
        <CsvImportPanel onImported={() => router.refresh()} />
      )}
    </div>
  );
}
