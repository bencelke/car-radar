"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMembersForAdmin } from "@/lib/repositories/admin-data";
import type { ClubMember } from "@/lib/types";
import { memberDetailPath } from "@/lib/utils/entity-paths";
import { Button } from "@/components/ui/button";

export function AdminMemberDirectoryPanel() {
  const { t } = useLocale();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [claimFilter, setClaimFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMembers(await getMembersForAdmin());
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
    return members.filter((m) => {
      const matchesSearch =
        !q ||
        m.displayName.toLowerCase().includes(q) ||
        (m.instagramHandle ?? "").toLowerCase().includes(q) ||
        (m.clubName ?? "").toLowerCase().includes(q);
      const status = m.claimStatus ?? "unclaimed";
      const matchesClaim =
        claimFilter === "all" || status === claimFilter;
      return matchesSearch && matchesClaim;
    });
  }, [members, search, claimFilter]);

  const counts = useMemo(() => {
    const tally = { unclaimed: 0, pending: 0, claimed: 0, rejected: 0 };
    for (const m of members) {
      const s = m.claimStatus ?? "unclaimed";
      if (s in tally) tally[s as keyof typeof tally] += 1;
    }
    return tally;
  }, [members]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-[#94A3B8]">
        <span>{t.admin.statusUnclaimed}: {counts.unclaimed}</span>
        <span>• {t.admin.statusPending}: {counts.pending}</span>
        <span>• {t.admin.statusClaimed}: {counts.claimed}</span>
        <span>• {t.admin.statusRejected}: {counts.rejected}</span>
      </div>

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        filterValue={claimFilter}
        onFilterChange={setClaimFilter}
        filterOptions={[
          { value: "all", label: t.admin.filterAll },
          { value: "unclaimed", label: t.admin.statusUnclaimed },
          { value: "pending", label: t.admin.statusPending },
          { value: "claimed", label: t.admin.statusClaimed },
          { value: "rejected", label: t.admin.statusRejected },
        ]}
      />

      <AdminDataState
        loading={loading}
        error={error}
        empty={!loading && !error && filtered.length === 0}
        emptyTitle={t.admin.noMembersFound}
      >
        <AdminTable
          rows={filtered.slice(0, 50)}
          rowKey={(m) => m.id}
          columns={[
            {
              key: "name",
              header: t.admin.colDisplayName,
              render: (m) => m.displayName,
            },
            {
              key: "car",
              header: t.admin.colCar,
              render: (m) =>
                [m.carMake, m.carModel, m.carYear].filter(Boolean).join(" ") || "—",
            },
            {
              key: "club",
              header: t.admin.colClub,
              render: (m) => m.clubName ?? m.clubId,
            },
            {
              key: "claim",
              header: t.admin.colClaimStatus,
              render: (m) => (
                <AdminStatusBadge status={m.claimStatus ?? "unclaimed"} />
              ),
            },
            {
              key: "image",
              header: t.admin.colImage,
              render: (m) =>
                m.imageUrl || m.avatarUrl ? t.admin.yes : t.admin.no,
            },
          ]}
          actions={(m) => (
            <div className="flex flex-wrap gap-2">
              <Link
                href={memberDetailPath(m)}
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
                title={t.admin.requiresServerAction}
              >
                {t.admin.transferOwnership}
              </Button>
            </div>
          )}
        />
      </AdminDataState>

      {filtered.length > 50 ? (
        <p className="text-xs text-[#64748B]">{t.admin.paginationTodo}</p>
      ) : null}
    </div>
  );
}
