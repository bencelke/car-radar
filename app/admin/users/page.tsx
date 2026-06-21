"use client";

import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminUsersPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navUsers}
        subtitle={t.admin.usersSectionSubtitle}
      />
      <AdminUsersPanel />
    </div>
  );
}
