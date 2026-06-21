"use client";

import { AdminSettingsPanel } from "@/components/admin/AdminSettingsPanel";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminSettingsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navSettings}
        subtitle={t.admin.settingsSectionSubtitle}
      />
      <AdminSettingsPanel />
    </div>
  );
}
