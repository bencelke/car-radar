"use client";

import { AdminAdvertisingPanel } from "@/components/admin/AdminAdvertisingPanel";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminAdvertisingPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navAdvertising}
        subtitle={t.admin.advertisingSectionSubtitle}
      />
      <AdminAdvertisingPanel />
    </div>
  );
}
