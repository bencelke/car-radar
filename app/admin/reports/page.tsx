"use client";

import { CommunityModerationPanel } from "@/components/admin/CommunityModerationPanel";
import { AdminCorrectionsPanel } from "@/components/admin/AdminCorrectionsPanel";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminReportsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navReports}
        subtitle={t.admin.reportsSectionSubtitle}
      />
      <AdminSectionCard title={t.admin.correctionsRemovalsTitle}>
        <AdminCorrectionsPanel />
      </AdminSectionCard>
      <CommunityModerationPanel />
    </div>
  );
}
