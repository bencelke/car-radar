"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { ProfileImageUploader } from "@/components/images/ProfileImageUploader";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  instagramProfileUrl,
  memberIdFromHandle,
  normalizeInstagramHandle,
  parseCommaList,
} from "@/lib/import/club-member-import";
import { prepareMemberForFirestore } from "@/lib/import/firestore-club-import";
import { getClubsForAdmin, getMembersForAdmin } from "@/lib/repositories/admin-data";
import { createOrUpdateClubMember } from "@/lib/repositories/club-members";
import type { Club, ClubMember, MemberRole } from "@/lib/types";
import { memberDetailPath } from "@/lib/utils/entity-paths";

const fieldClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]";
const labelClass = "mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]";

const ROLES: MemberRole[] = [
  "member",
  "founder",
  "club_owner",
  "club_admin",
  "road_captain",
  "photographer",
];

export function AdminMembersPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubId, setClubId] = useState("");
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [selected, setSelected] = useState<ClubMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    instagramHandle: "",
    displayName: "",
    carName: "",
    carMake: "",
    carModel: "",
    carYear: "",
    horsepower: "",
    buildSummary: "",
    buildTags: "",
    city: "",
    country: "Germany",
    area: "",
    role: "member" as MemberRole,
  });

  const loadClubs = useCallback(async () => {
    const list = await getClubsForAdmin();
    setClubs(list);
    setClubId((prev) => prev || list[0]?.id || "");
  }, []);

  const loadMembers = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    const list = await getMembersForAdmin(clubId);
    setMembers(list);
    setLoading(false);
  }, [clubId]);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  if (blocked) return <AdminGuardFallback />;

  const actor = user ? { uid: user.uid } : null;
  const canWrite = isFirebaseConfigured && Boolean(actor);
  const club = clubs.find((c) => c.id === clubId);

  function applyMember(member: ClubMember) {
    setSelected(member);
    setForm({
      instagramHandle: member.instagramHandle ?? "",
      displayName: member.displayName,
      carName: member.carName ?? "",
      carMake: member.carMake ?? "",
      carModel: member.carModel ?? "",
      carYear: member.carYear?.toString() ?? "",
      horsepower: member.horsepower?.toString() ?? "",
      buildSummary: member.buildSummary ?? "",
      buildTags: (member.buildTags ?? []).join(", "),
      city: member.city,
      country: member.country,
      area: member.area ?? "",
      role: member.role ?? "member",
    });
  }

  async function handleSave() {
    if (!actor || !clubId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const handle = normalizeInstagramHandle(form.instagramHandle);
      if (!handle) throw new Error("Instagram handle required");
      const memberId = selected?.id ?? memberIdFromHandle(clubId, handle);
      const now = new Date().toISOString();
      const member: ClubMember = {
        id: memberId,
        clubId,
        clubName: club?.name ?? clubId.toUpperCase(),
        displayName: form.displayName || `@${handle}`,
        instagramHandle: handle,
        instagram: instagramProfileUrl(handle),
        status: "approved",
        city: form.city,
        country: form.country,
        area: form.area || undefined,
        carName: form.carName || undefined,
        carMake: form.carMake || undefined,
        carModel: form.carModel || undefined,
        carYear: form.carYear || undefined,
        horsepower: form.horsepower ? Number(form.horsepower) : undefined,
        buildSummary: form.buildSummary || undefined,
        buildTags: parseCommaList(form.buildTags),
        role: form.role,
        verifiedByClub: selected?.verifiedByClub ?? false,
        featured: selected?.featured ?? false,
        claimStatus: selected?.claimStatus ?? "unclaimed",
        claimedByUid: selected?.claimedByUid ?? null,
        imageUrl: selected?.imageUrl,
        avatarUrl: selected?.avatarUrl,
        createdAt: selected?.createdAt ?? now,
        updatedAt: now,
      };

      await createOrUpdateClubMember(
        prepareMemberForFirestore(member, actor),
        actor
      );
      setMessage(t.admin.memberSaved);
      setSelected(member);
      await loadMembers();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-[#64748B]">{t.admin.selectClub}</label>
        <select
          value={clubId}
          onChange={(e) => {
            setClubId(e.target.value);
            setSelected(null);
          }}
          className={`${fieldClass} max-w-xs`}
        >
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <GlassPanel>
          <PanelHeader title={t.admin.membersListTitle} />
          <div className="max-h-[420px] space-y-1 overflow-y-auto p-3 pt-0">
            {loading ? (
              <Loader2 className="mx-auto size-5 animate-spin text-[#64748B]" />
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => applyMember(member)}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/[0.03]"
                >
                  <span className="truncate text-[#F8FAFC]">{member.displayName}</span>
                  <span className="truncate text-[10px] text-[#64748B]">
                    {member.carName ?? member.carMake ?? member.instagramHandle}
                  </span>
                </button>
              ))
            )}
          </div>
        </GlassPanel>

        <GlassPanel>
          <PanelHeader
            title={selected ? t.admin.editMember : t.admin.addMember}
          />
          <div className="space-y-3 p-4 pt-0">
            {!canWrite ? (
              <p className="text-sm text-amber-200/90">{t.admin.firestoreNotConfigured}</p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Instagram</label>
                <input
                  value={form.instagramHandle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instagramHandle: e.target.value }))
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t.common.name}</label>
                <input
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t.members.car}</label>
                <input
                  value={form.carName}
                  onChange={(e) => setForm((f) => ({ ...f, carName: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as MemberRole }))
                  }
                  className={fieldClass}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t.common.city}</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>HP</label>
                <input
                  value={form.horsepower}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, horsepower: e.target.value }))
                  }
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t.members.buildSummary}</label>
              <textarea
                rows={2}
                value={form.buildSummary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, buildSummary: e.target.value }))
                }
                className={`${fieldClass} min-h-[56px] py-2`}
              />
            </div>

            {selected ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-3">
                <p className="mb-2 text-xs font-semibold text-[#CBD5E1]">
                  {t.admin.uploadCarPhoto}
                </p>
                <ProfileImageUploader
                  ownerType="member"
                  ownerId={selected.id}
                  clubId={clubId}
                  memberId={selected.id}
                  baseMember={selected}
                  imageKind="member_car"
                  currentImageUrl={selected.avatarUrl ?? selected.imageUrl}
                  onUploaded={() => void loadMembers()}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canWrite || busy}
                onClick={() => void handleSave()}
                className="min-h-11 border border-[#EF4444]/40 bg-[#EF4444]/20"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : t.admin.saveMember}
              </Button>
              {selected ? (
                <Link
                  href={memberDetailPath(selected)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs text-[#CBD5E1]"
                >
                  <ExternalLink className="size-3.5" />
                  {t.members.viewProfile}
                </Link>
              ) : null}
            </div>

            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
