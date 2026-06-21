"use client";

import { FirebaseDiagnosticsPanel } from "@/components/admin/FirebaseDiagnosticsPanel";
import { useLocale } from "@/components/providers/LocaleProvider";

export { AdminClaimsPanel } from "@/components/admin/AdminClaimsPanel";
export { AdminShopsPanel } from "@/components/admin/AdminShopsPanel";

export function AdminDiagnosticsPanel() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {t.admin.tabDiagnostics}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {t.admin.diagnosticsSubtitle}
        </p>
      </div>
      <FirebaseDiagnosticsPanel expanded />
    </div>
  );
}
