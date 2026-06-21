"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  adminAssignClaimOwner,
  adminUpdateProfileClaimStatus,
  getProfileClaimsForAdmin,
} from "@/lib/repositories/profile-claims";
import type { ProfileClaim, ProfileClaimStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";

function targetHref(claim: ProfileClaim): string {
  if (claim.targetType === "member") return `/members/${claim.targetId}`;
  if (claim.targetType === "club") return `/clubs/${claim.targetId}`;
  return `/shops/${claim.targetId}`;
}

export function AdminClaimsPanel() {
  const { t } = useLocale();
  const { blocked, AdminGuardFallback, user } = useAdminGuard();
  const [claims, setClaims] = useState<ProfileClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getProfileClaimsForAdmin();
      setClaims(rows);
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
    return claims.filter((c) => {
      const matchesSearch =
        !q ||
        (c.targetName ?? "").toLowerCase().includes(q) ||
        (c.requesterName ?? "").toLowerCase().includes(q) ||
        (c.requesterEmail ?? "").toLowerCase().includes(q) ||
        c.targetId.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, search, statusFilter]);

  async function handleStatus(
    claim: ProfileClaim,
    status: ProfileClaimStatus,
    assignOwner: boolean
  ) {
    if (!user?.uid) return;
    setActionId(claim.id);
    setActionNote(null);
    try {
      if (assignOwner && status === "approved") {
        await adminAssignClaimOwner({
          claimId: claim.id,
          targetType: claim.targetType,
          targetId: claim.targetId,
          ownerUid: claim.requestedByUid,
          reviewedByUid: user.uid,
        });
      } else {
        await adminUpdateProfileClaimStatus(
          claim.id,
          status,
          null,
          user.uid
        );
      }
      await load();
    } catch {
      setActionNote(t.admin.claimActionFailed);
    } finally {
      setActionId(null);
    }
  }

  if (blocked) return <AdminGuardFallback />;

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-3 py-2 text-xs text-[#93C5FD]">
        {t.admin.claimsReviewNote}
      </p>

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "all", label: t.admin.filterAll },
          { value: "pending", label: t.admin.statusPending },
          { value: "approved", label: t.admin.statusApproved },
          { value: "rejected", label: t.admin.statusRejected },
          { value: "needs_more_info", label: t.admin.statusNeedsInfo },
        ]}
      />

      <AdminDataState
        loading={loading}
        error={error}
        empty={!loading && !error && filtered.length === 0}
        emptyTitle={t.admin.noClaimsFound}
        emptyDescription={t.admin.claimsEmptyHint}
      >
        <AdminTable
          rows={filtered}
          rowKey={(c) => c.id}
          columns={[
            {
              key: "type",
              header: t.admin.colType,
              render: (c) =>
                c.targetType === "club"
                  ? t.admin.claimTypeClubOwner
                  : c.targetType === "shop"
                    ? t.admin.claimTypeBusiness
                    : t.admin.claimTypeProfile,
            },
            {
              key: "target",
              header: t.admin.colTarget,
              render: (c) => c.targetName ?? c.targetId,
            },
            {
              key: "requester",
              header: t.admin.colRequester,
              render: (c) => c.requesterName ?? c.requesterEmail ?? c.requestedByUid,
            },
            {
              key: "proof",
              header: t.admin.colProof,
              render: (c) =>
                c.proofUrl ? (
                  <a
                    href={c.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#93C5FD] hover:underline"
                  >
                    {t.admin.viewProof}
                  </a>
                ) : (
                  "—"
                ),
            },
            {
              key: "status",
              header: t.admin.colStatus,
              render: (c) => <AdminStatusBadge status={c.status} />,
            },
            {
              key: "submitted",
              header: t.admin.createdAt,
              render: (c) =>
                c.createdAt
                  ? new Date(String(c.createdAt)).toLocaleDateString()
                  : "—",
            },
          ]}
          actions={(c) => (
            <div className="flex flex-wrap gap-2">
              <Link
                href={targetHref(c)}
                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-[#93C5FD] hover:bg-white/[0.05]"
              >
                <ExternalLink className="size-3" />
                {t.admin.viewTarget}
              </Link>
              {c.status === "pending" ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-emerald-300"
                    disabled={actionId === c.id}
                    onClick={() => void handleStatus(c, "approved", true)}
                  >
                    {actionId === c.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : null}
                    {t.admin.approve}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-amber-200"
                    disabled={actionId === c.id}
                    onClick={() => void handleStatus(c, "needs_more_info", false)}
                  >
                    {t.admin.needsMoreInfo}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-red-300"
                    disabled={actionId === c.id}
                    onClick={() => void handleStatus(c, "rejected", false)}
                  >
                    {t.admin.reject}
                  </Button>
                </>
              ) : null}
            </div>
          )}
        />
      </AdminDataState>

      {actionNote ? (
        <p className="text-xs text-red-300">{actionNote}</p>
      ) : null}

      {!loading && claims.length === 0 ? (
        <AdminEmptyState
          title={t.admin.claimsNextBuildTitle}
          description={t.admin.claimsNextBuildHint}
        />
      ) : null}
    </div>
  );
}
