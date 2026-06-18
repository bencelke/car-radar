"use client";

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Submission } from "@/lib/types";

type AdminDashboardProps = {
  initialSubmissions: Submission[];
};

export function AdminDashboard({ initialSubmissions }: AdminDashboardProps) {
  const { t } = useLocale();
  const pendingCount = initialSubmissions.filter(
    (s) => s.status === "pending"
  ).length;

  return (
    <div className="mx-auto max-w-[1920px] flex-1 p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
          {t.admin.dashboardTitle}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">{t.admin.dashboardSubtitle}</p>
      </div>

      <AdminWorkspace
        initialSubmissions={initialSubmissions}
        pendingCount={pendingCount}
      />
    </div>
  );
}
