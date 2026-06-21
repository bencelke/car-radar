"use client";

import { AdminDiagnosticsPanel } from "@/components/admin/AdminSectionPanels";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminDiagnosticsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navDiagnostics}
        subtitle={t.admin.diagnosticsSectionSubtitle}
      />
      <AdminDiagnosticsPanel />
    </div>
  );
}
