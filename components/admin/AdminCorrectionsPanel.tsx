"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  adminUpdateCorrectionRequestStatus,
  getPendingCorrectionRequests,
} from "@/lib/repositories/correction-requests";
import type { CorrectionRequest, CorrectionRequestStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";

function targetHref(req: CorrectionRequest): string {
  if (req.targetType === "member") return `/members/${req.targetId}`;
  if (req.targetType === "club") return `/clubs/${req.targetId}`;
  if (req.targetType === "shop") return `/shops/${req.targetId}`;
  return `/events/${req.targetId}`;
}

export function AdminCorrectionsPanel() {
  const { t } = useLocale();
  const { blocked, AdminGuardFallback, user } = useAdminGuard();
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await getPendingCorrectionRequests());
    } catch {
      setError(t.admin.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.admin.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...requests].sort((a, b) =>
        String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
      ),
    [requests]
  );

  async function handleStatus(
    req: CorrectionRequest,
    status: CorrectionRequestStatus
  ) {
    if (!user?.uid) return;
    setActionId(req.id);
    try {
      await adminUpdateCorrectionRequestStatus(req.id, status, null, user.uid);
      await load();
    } finally {
      setActionId(null);
    }
  }

  if (blocked) return <AdminGuardFallback />;

  return (
    <AdminDataState
      loading={loading}
      error={error}
      empty={!loading && !error && sorted.length === 0}
      emptyTitle={t.admin.noCorrectionsFound}
      emptyDescription={t.admin.correctionsEmptyHint}
    >
      <AdminTable
        rows={sorted}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "type",
            header: t.admin.colType,
            render: (r) => t.corrections.requestTypes[r.requestType],
          },
          {
            key: "target",
            header: t.admin.colTarget,
            render: (r) => r.targetName ?? r.targetId,
          },
          {
            key: "requester",
            header: t.admin.colRequester,
            render: (r) => r.requesterName ?? r.requesterEmail ?? "—",
          },
          {
            key: "message",
            header: t.admin.colMessage,
            render: (r) => (
              <span className="line-clamp-2 max-w-xs text-xs text-[#94A3B8]">
                {r.message}
              </span>
            ),
          },
          {
            key: "status",
            header: t.admin.colStatus,
            render: (r) => <AdminStatusBadge status={r.status} />,
          },
          {
            key: "submitted",
            header: t.admin.createdAt,
            render: (r) =>
              r.createdAt
                ? new Date(String(r.createdAt)).toLocaleDateString()
                : "—",
          },
        ]}
        actions={(r) => (
          <div className="flex flex-wrap gap-2">
            <Link
              href={targetHref(r)}
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs text-[#93C5FD] hover:bg-white/[0.05]"
            >
              <ExternalLink className="size-3" />
              {t.admin.viewTarget}
            </Link>
            {r.status === "pending" ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-emerald-300"
                  disabled={actionId === r.id}
                  onClick={() => void handleStatus(r, "resolved")}
                >
                  {actionId === r.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : null}
                  {t.admin.markResolved}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-red-300"
                  disabled={actionId === r.id}
                  onClick={() => void handleStatus(r, "rejected")}
                >
                  {t.admin.reject}
                </Button>
              </>
            ) : null}
          </div>
        )}
      />
    </AdminDataState>
  );
}
