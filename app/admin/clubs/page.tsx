"use client";

import { AdminClubsPanel } from "@/components/admin/AdminClubsPanel";
import { AdminImportsPanel } from "@/components/admin/AdminImportsPanel";
import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { FirestoreDataPanel } from "@/components/admin/FirestoreDataPanel";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminClubsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navClubs}
        subtitle={t.admin.clubsSectionSubtitle}
      />
      <AdminSectionCard title={t.admin.clubRequestsQueue}>
        <AdminComingSoon description={t.admin.clubRequestsComingSoon} />
      </AdminSectionCard>
      <AdminClubsPanel />
      <FirestoreDataPanel />
      <AdminImportsPanel />
    </div>
  );
}
