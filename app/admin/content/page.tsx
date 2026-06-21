"use client";

import { AdminContentPanel } from "@/components/admin/AdminContentPanel";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminContentPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navContent}
        subtitle={t.admin.contentSectionSubtitle}
      />
      <AdminContentPanel />
    </div>
  );
}
