"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Loader2 } from "lucide-react";

import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getUserDisplayTitle, isAdminUser, isFounderUser } from "@/lib/auth/permissions";
import { getUsersForAdmin } from "@/lib/repositories/admin-data";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function AdminUsersPanel() {
  const { t } = useLocale();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getUsersForAdmin());
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
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.uid ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.displayName ?? "").toLowerCase().includes(q);
      const matchesRole =
        roleFilter === "all" ||
        u.role === roleFilter ||
        (roleFilter === "admin" && isAdminUser(u)) ||
        (roleFilter === "founder" && isFounderUser(u));
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function copyUid(uid: string) {
    await navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  }

  if (blocked) return <AdminGuardFallback />;

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-100/90">
        {t.admin.roleChangeSecurityNote}
      </p>

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        filterOptions={[
          { value: "all", label: t.admin.filterAll },
          { value: "founder", label: t.members.roleFounder },
          { value: "admin", label: t.admin.roleAdminLabel },
          { value: "member", label: t.members.roleMember },
        ]}
      />

      <AdminDataState
        loading={loading}
        error={error}
        empty={!loading && !error && filtered.length === 0}
        emptyTitle={t.admin.noUsersFound}
        emptyDescription={t.admin.usersEmptyHint}
      >
        <AdminTable
          rows={filtered}
          rowKey={(u) => u.uid ?? u.email}
          columns={[
            {
              key: "name",
              header: t.admin.colDisplayName,
              render: (u) => u.displayName ?? "—",
            },
            {
              key: "email",
              header: t.admin.colEmail,
              render: (u) => u.email ?? "—",
            },
            {
              key: "role",
              header: t.admin.colRole,
              render: (u) => (
                <div className="flex flex-wrap gap-1">
                  <AdminStatusBadge status={u.role} />
                  {isFounderUser(u) ? (
                    <AdminStatusBadge status="founder" />
                  ) : null}
                  {isAdminUser(u) && !isFounderUser(u) ? (
                    <AdminStatusBadge status="admin" />
                  ) : null}
                </div>
              ),
            },
            {
              key: "title",
              header: t.admin.colTitle,
              render: (u) => getUserDisplayTitle(u) ?? "—",
            },
            {
              key: "uid",
              header: "UID",
              className: "font-mono text-[11px]",
              render: (u) => (
                <span className="font-mono text-[11px]">
                  {(u.uid ?? "—").slice(0, 12)}…
                </span>
              ),
            },
          ]}
          actions={(u) => (
            <div className="flex flex-wrap gap-2">
              {u.uid ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => void copyUid(u.uid!)}
                  >
                    <Copy className="mr-1 size-3" />
                    {copiedUid === u.uid ? t.admin.copied : t.admin.copyUid}
                  </Button>
                  <Link
                    href={`/profile/${u.uid}`}
                    className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-[#93C5FD] hover:bg-white/[0.05]"
                  >
                    <ExternalLink className="size-3" />
                    {t.admin.viewProfile}
                  </Link>
                </>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs opacity-50"
                disabled
                title={t.admin.requiresServerAction}
              >
                {t.admin.promoteDemote}
              </Button>
            </div>
          )}
        />
      </AdminDataState>
    </div>
  );
}
