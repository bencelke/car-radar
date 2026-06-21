"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { AdminShopsPanel } from "@/components/admin/AdminShopsPanel";
import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import { AdminPageHeader } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";

function AdminShopsPageContent() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const showCreate = searchParams.get("action") === "create";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navShopsVendors}
        subtitle={t.admin.shopsSectionSubtitle}
      />
      {showCreate ? (
        <AdminComingSoon
          title={t.admin.addShop}
          description={t.admin.shopCreateFieldsHint}
        />
      ) : null}
      <AdminShopsPanel />
      <AdminComingSoon
        title={t.admin.shopCategoriesTitle}
        description={t.admin.shopCategoriesComingSoon}
      />
      <p className="text-xs text-[#64748B]">
        <Link href={ADMIN_ROUTES.submissions} className="text-[#93C5FD] hover:underline">
          {t.admin.reviewShopSubmissions}
        </Link>
      </p>
    </div>
  );
}

export default function AdminShopsPage() {
  return (
    <Suspense fallback={null}>
      <AdminShopsPageContent />
    </Suspense>
  );
}
