"use client";

import { AdminMemberDirectoryPanel } from "@/components/admin/AdminMemberDirectoryPanel";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import { AdminActionCard } from "@/components/admin/AdminActionCard";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";
import { Upload, UserPlus } from "lucide-react";

export default function AdminMembersPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navMembersGarages}
        subtitle={t.admin.membersSectionSubtitle}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminActionCard
          title={t.admin.addMember}
          icon={UserPlus}
          badge={t.admin.comingNext}
          disabled
        />
        <AdminActionCard
          title={t.admin.importMembersCsv}
          href={ADMIN_ROUTES.clubs}
          icon={Upload}
          description={t.admin.importMembersHint}
        />
      </div>
      <AdminSectionCard title={t.admin.memberStatusFilters}>
        <AdminMemberDirectoryPanel />
      </AdminSectionCard>
      <AdminMembersPanel />
    </div>
  );
}
