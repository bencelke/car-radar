"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { getAdminNavLabelKey, isFounderUser } from "@/lib/auth/permissions";
import type { Submission } from "@/lib/types";

type AdminDashboardProps = {
  initialSubmissions: Submission[];
};

export function AdminDashboard({ initialSubmissions }: AdminDashboardProps) {
  const { t } = useLocale();
  const { profile } = useAuth();
  const pendingCount = initialSubmissions.filter(
    (s) => s.status === "pending"
  ).length;

  const navKey = getAdminNavLabelKey(profile);
  const title =
    navKey === "founderConsole"
      ? t.profile.founderConsole
      : t.admin.dashboardTitle;

  const subtitle = isFounderUser(profile)
    ? t.admin.founderDashboardSubtitle
    : t.admin.dashboardSubtitle;

  return (
    <div className="mx-auto max-w-[1920px] flex-1 p-4 lg:p-6">
      <AdminHeader title={title} subtitle={subtitle} />
      <AdminWorkspace
        initialSubmissions={initialSubmissions}
        pendingCount={pendingCount}
      />
    </div>
  );
}
