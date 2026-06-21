"use client";

import { AdminClaimsPanel } from "@/components/admin/AdminClaimsPanel";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminClaimsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navClaims}
        subtitle={t.admin.claimsSectionSubtitle}
      />
      <AdminSectionCard title={t.admin.claimTypesTitle}>
        <ul className="space-y-1 text-sm text-[#94A3B8]">
          <li>• {t.admin.claimTypeProfile}</li>
          <li>• {t.admin.claimTypeClubOwner}</li>
          <li>• {t.admin.claimTypeClubManager}</li>
          <li>• {t.admin.claimTypeBusiness}</li>
          <li>• {t.admin.claimTypeEventOrganizer}</li>
        </ul>
      </AdminSectionCard>
      <AdminClaimsPanel />
    </div>
  );
}
