"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";
import { getShopsForAdmin } from "@/lib/repositories/admin-data";
import type { CarShop } from "@/lib/types";
import { shopDetailPath } from "@/lib/utils/entity-paths";
import { Button } from "@/components/ui/button";

export function AdminShopsPanel() {
  const { t } = useLocale();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [shops, setShops] = useState<CarShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setShops(await getShopsForAdmin());
    } catch {
      setError(t.admin.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.admin.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shops.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.category ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, search, statusFilter]);

  if (blocked) return <AdminGuardFallback />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminToolbar
          search={search}
          onSearchChange={setSearch}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: "all", label: t.admin.filterAll },
            { value: "approved", label: t.admin.statusApproved },
            { value: "pending", label: t.admin.statusPending },
          ]}
          className="flex-1"
        />
        <Link
          href={`${ADMIN_ROUTES.shops}?action=create`}
          className="inline-flex h-9 shrink-0 items-center rounded-lg border border-white/[0.08] px-3 text-sm text-[#F8FAFC] hover:border-[#3B82F6]/30"
        >
          {t.admin.addShop}
        </Link>
      </div>

      <AdminDataState
        loading={loading}
        error={error}
        empty={!loading && !error && filtered.length === 0}
        emptyTitle={t.admin.noShopsFound}
        emptyDescription={t.admin.shopsEmptyHint}
      >
        <AdminTable
          rows={filtered}
          rowKey={(s) => s.id}
          columns={[
            {
              key: "name",
              header: t.admin.colName,
              render: (s) => s.name,
            },
            {
              key: "category",
              header: t.admin.colCategory,
              render: (s) => s.category ?? "—",
            },
            {
              key: "city",
              header: t.admin.colCity,
              render: (s) => `${s.city}, ${s.country}`,
            },
            {
              key: "status",
              header: t.admin.colStatus,
              render: (s) => <AdminStatusBadge status={s.status} />,
            },
            {
              key: "instagram",
              header: "Instagram",
              render: (s) => s.instagram ?? "—",
            },
          ]}
          actions={(s) => (
            <div className="flex flex-wrap gap-2">
              <Link
                href={shopDetailPath(s)}
                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-[#93C5FD] hover:bg-white/[0.05]"
              >
                <ExternalLink className="size-3" />
                {t.admin.viewPublic}
              </Link>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs opacity-50"
                disabled
                title={t.admin.comingNext}
              >
                {t.admin.edit}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs opacity-50"
                disabled
                title={t.admin.requiresServerAction}
              >
                {t.admin.markVerified}
              </Button>
            </div>
          )}
        />
      </AdminDataState>

      <p className="text-xs text-[#64748B]">{t.admin.shopsManageHint}</p>
    </div>
  );
}
