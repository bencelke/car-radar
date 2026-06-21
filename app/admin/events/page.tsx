"use client";

import { AdminEventsPanel } from "@/components/admin/AdminEventsPanel";
import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminEventsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navEvents}
        subtitle={t.admin.eventsSectionSubtitle}
      />
      <AdminSectionCard title={t.admin.pendingEventsQueue}>
        <AdminComingSoon description={t.admin.pendingEventsComingSoon} />
      </AdminSectionCard>
      <AdminEventsPanel />
    </div>
  );
}
