"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Link2, Mail, QrCode } from "lucide-react";

import { AdminActionCard } from "@/components/admin/AdminActionCard";
import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import {
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/AdminSectionCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { createInvite, invitePublicUrl } from "@/lib/repositories/user-invites";
import { getInvitesForAdmin } from "@/lib/repositories/admin-data";
import type { UserInvite } from "@/lib/types";
import { Button } from "@/components/ui/button";

const DM_TEMPLATE =
  "Hey — we're mapping the local car scene on ShiftIt. Claim your profile here:";

export function AdminInvitationsPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [invites, setInvites] = useState<UserInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvites(await getInvitesForAdmin());
    } catch {
      setError(t.admin.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.admin.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(
    () => invites.filter((i) => i.status === "active").length,
    [invites]
  );

  async function handleCreateUserInvite() {
    if (!user) return;
    setCreating(true);
    try {
      const invite = await createInvite({
        inviterUid: user.uid,
        inviteType: "join_shiftit",
      });
      setLastInviteUrl(invitePublicUrl(invite));
      setPanel("user-invite-created");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t.admin.navInvitations}
        subtitle={t.admin.invitationsSectionSubtitle}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminActionCard
          title={t.admin.createUserInvite}
          icon={Link2}
          onClick={() => void handleCreateUserInvite()}
          badge={creating ? t.admin.loading : undefined}
        />
        <AdminActionCard
          title={t.admin.createClubManagerInvite}
          icon={Link2}
          badge={t.admin.comingNext}
          onClick={() => setPanel("club-manager")}
        />
        <AdminActionCard
          title={t.admin.generateProfileClaimLink}
          icon={Link2}
          badge={t.admin.comingNext}
          onClick={() => setPanel("profile-claim")}
        />
        <AdminActionCard
          title={t.admin.generateClubOwnerInvite}
          icon={Link2}
          badge={t.admin.comingNext}
          onClick={() => setPanel("club-owner")}
        />
        <AdminActionCard
          title={t.admin.copyInstagramDm}
          icon={Mail}
          onClick={() => void copyText(`${DM_TEMPLATE} ${lastInviteUrl ?? "[invite link]"}`)}
        />
        <AdminActionCard
          title={t.admin.generateQr}
          icon={QrCode}
          badge={t.admin.comingNext}
          onClick={() => setPanel("qr")}
        />
      </div>

      {panel === "user-invite-created" && lastInviteUrl ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100">
          <p className="font-medium">{t.admin.inviteCreated}</p>
          <p className="mt-2 break-all font-mono text-xs">{lastInviteUrl}</p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => void copyText(lastInviteUrl)}
          >
            <Copy className="mr-1 size-3" />
            {copied ? t.admin.copied : t.admin.copyLink}
          </Button>
        </div>
      ) : null}

      {panel && panel !== "user-invite-created" ? (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#151B24]/50 p-4">
          <p className="text-sm text-[#94A3B8]">{t.admin.invitationsComingSoon}</p>
          <button
            type="button"
            className="mt-2 text-xs text-[#93C5FD] hover:underline"
            onClick={() => setPanel(null)}
          >
            {t.admin.closePanel}
          </button>
        </div>
      ) : null}

      <AdminSectionCard
        title={t.admin.inviteTypesTitle}
        subtitle={`${activeCount} ${t.admin.statusActive.toLowerCase()}`}
      >
        <ul className="mb-4 space-y-1 text-xs text-[#94A3B8]">
          <li>• {t.admin.inviteTypeUser}</li>
          <li>• {t.admin.inviteTypeClubOwner}</li>
          <li>• {t.admin.inviteTypeClubManager}</li>
          <li>• {t.admin.inviteTypeProfileClaim}</li>
          <li>• {t.admin.inviteTypeBusinessClaim}</li>
          <li>• {t.admin.inviteTypeEventOrganizer}</li>
        </ul>

        <AdminDataState
          loading={loading}
          error={error}
          empty={!loading && !error && invites.length === 0}
          emptyTitle={t.admin.noInvitesFound}
          emptyDescription={t.admin.invitationsEmptyHint}
        >
          <AdminTable
            rows={invites}
            rowKey={(i) => i.id}
            columns={[
              {
                key: "type",
                header: t.admin.colType,
                render: (i) => i.inviteType,
              },
              {
                key: "code",
                header: t.admin.colCode,
                render: (i) => i.inviteCode,
              },
              {
                key: "status",
                header: t.admin.colStatus,
                render: (i) => <AdminStatusBadge status={i.status} />,
              },
              {
                key: "created",
                header: t.admin.createdAt,
                render: (i) => new Date(i.createdAt).toLocaleDateString(),
              },
            ]}
            actions={(i) => (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => void copyText(invitePublicUrl(i))}
              >
                <Copy className="mr-1 size-3" />
                {t.admin.copyLink}
              </Button>
            )}
          />
        </AdminDataState>
      </AdminSectionCard>
    </div>
  );
}
