"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, UserPlus } from "lucide-react";

import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  buildClubFromDetails,
  instagramProfileUrl,
  memberIdFromHandle,
  memberImagePublicUrl,
  normalizeInstagramHandle,
  parseCommaList,
} from "@/lib/import/club-member-import";
import {
  prepareClubForFirestore,
  prepareMemberForFirestore,
} from "@/lib/import/firestore-club-import";
import { wbnClub, wbnMembers } from "@/lib/mock-data/clubs/wbn";
import {
  bulkCreateOrUpdateClubMembers,
  createOrUpdateClubMember,
} from "@/lib/repositories/club-members";
import { createOrUpdateClub } from "@/lib/repositories/clubs";
import type { ClubMember } from "@/lib/types";

export function FirestoreDataPanel() {
  const { t } = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [clubForm, setClubForm] = useState({
    clubId: "",
    name: "",
    city: "Wiesbaden",
    country: "Germany",
    area: "",
    description: "",
    instagram: "",
    vehicleTypes: "",
    primaryBrands: "",
  });

  const [memberForm, setMemberForm] = useState({
    clubId: "wbn",
    instagramHandle: "",
    carName: "",
    city: "Wiesbaden",
    country: "Germany",
    area: "",
    role: "member",
    buildTags: "",
  });

  if (blocked) return <AdminGuardFallback />;

  const actor = user ? { uid: user.uid } : null;
  const canWrite = isFirebaseConfigured && Boolean(actor);

  async function handleSaveClub() {
    if (!actor) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const clubId = clubForm.clubId.trim().toLowerCase();
      const club = buildClubFromDetails(
        {
          clubId,
          clubName: clubForm.name,
          city: clubForm.city,
          country: clubForm.country,
          area: clubForm.area,
          description: clubForm.description,
          instagram: clubForm.instagram,
          website: "",
          vehicleTypes: clubForm.vehicleTypes,
          primaryBrands: clubForm.primaryBrands,
          tags: "",
        },
        0
      );
      await createOrUpdateClub(prepareClubForFirestore(club, actor), actor);
      setMessage(t.admin.firestoreClubSaved);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveMember() {
    if (!actor) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const clubId = memberForm.clubId.trim();
      const handle = normalizeInstagramHandle(memberForm.instagramHandle);
      if (!handle) throw new Error("Instagram handle required");
      const memberId = memberIdFromHandle(clubId, handle);
      const now = new Date().toISOString();
      const member: ClubMember = {
        id: memberId,
        clubId,
        clubName: clubForm.name || clubId.toUpperCase(),
        displayName: `@${handle}`,
        instagramHandle: handle,
        instagram: instagramProfileUrl(handle),
        status: "approved",
        city: memberForm.city,
        country: memberForm.country,
        area: memberForm.area || undefined,
        carName: memberForm.carName,
        buildSummary: `${clubId} member car profile.`,
        buildTags: parseCommaList(memberForm.buildTags),
        imageUrl: memberImagePublicUrl(clubId, memberId),
        avatarUrl: memberImagePublicUrl(clubId, memberId),
        role: memberForm.role as ClubMember["role"],
        verifiedByClub: false,
        featured: false,
        claimStatus: "unclaimed",
        claimedByUid: null,
        createdAt: now,
        updatedAt: now,
      };
      await createOrUpdateClubMember(
        prepareMemberForFirestore(member, actor),
        actor
      );
      setMessage(t.admin.firestoreMemberSaved);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleImportWbn() {
    if (!actor) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const club = prepareClubForFirestore(
        { ...wbnClub, memberCount: wbnMembers.length },
        actor
      );
      await createOrUpdateClub(club, actor);
      const members = wbnMembers.map((m) =>
        prepareMemberForFirestore(
          {
            ...m,
            claimStatus: m.claimStatus ?? "unclaimed",
            claimedByUid: m.claimedByUid ?? null,
          },
          actor
        )
      );
      const result = await bulkCreateOrUpdateClubMembers(members, actor);
      setMessage(
        `${t.admin.firestoreWbnImported}: ${result.saved} members (${result.skipped} skipped)`
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0B1118] px-2 py-1.5 text-sm text-[#F8FAFC]";

  return (
    <GlassPanel>
      <PanelHeader title={t.admin.tabFirestoreData} />
      <div className="space-y-6 p-4 lg:p-5">
        <p className="text-sm text-[#94A3B8]">{t.admin.firestoreDataSubtitle}</p>

        {!isFirebaseConfigured ? (
          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200/90">
            {t.admin.firestoreNotConfigured}
          </p>
        ) : null}

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {t.admin.firestoreImportWbn}
          </h3>
          <Button
            type="button"
            size="sm"
            disabled={!canWrite || busy}
            onClick={() => void handleImportWbn()}
            className="gap-1.5"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Database className="size-3.5" />
            )}
            {t.admin.firestoreImportWbn}
          </Button>
          <p className="text-[10px] text-[#64748B]">{t.admin.firestoreWbnHint}</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-white/[0.06] p-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1]">
              <Database className="size-3.5" />
              {t.admin.firestoreAddClub}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                placeholder="clubId"
                value={clubForm.clubId}
                onChange={(e) =>
                  setClubForm((f) => ({
                    ...f,
                    clubId: e.target.value.toLowerCase(),
                  }))
                }
                className={inputClass}
              />
              <input
                placeholder={t.common.name}
                value={clubForm.name}
                onChange={(e) => setClubForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
              <input
                placeholder={t.common.city}
                value={clubForm.city}
                onChange={(e) => setClubForm((f) => ({ ...f, city: e.target.value }))}
                className={inputClass}
              />
              <input
                placeholder="Country"
                value={clubForm.country}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, country: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Area"
                value={clubForm.area}
                onChange={(e) => setClubForm((f) => ({ ...f, area: e.target.value }))}
                className={inputClass}
              />
              <input
                placeholder="Instagram"
                value={clubForm.instagram}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, instagram: e.target.value }))
                }
                className={inputClass}
              />
              <textarea
                placeholder={t.common.description}
                value={clubForm.description}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                placeholder={t.clubs.vehicleTypes}
                value={clubForm.vehicleTypes}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, vehicleTypes: e.target.value }))
                }
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                placeholder={t.clubs.primaryBrands}
                value={clubForm.primaryBrands}
                onChange={(e) =>
                  setClubForm((f) => ({ ...f, primaryBrands: e.target.value }))
                }
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!canWrite || busy || !clubForm.clubId || !clubForm.name}
              onClick={() => void handleSaveClub()}
            >
              {t.admin.firestoreSaveClub}
            </Button>
          </div>

          <div className="space-y-2 rounded-lg border border-white/[0.06] p-3">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E1]">
              <UserPlus className="size-3.5" />
              {t.admin.firestoreAddMember}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                placeholder="clubId"
                value={memberForm.clubId}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, clubId: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Instagram handle"
                value={memberForm.instagramHandle}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, instagramHandle: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Car name"
                value={memberForm.carName}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, carName: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Role"
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, role: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder={t.common.city}
                value={memberForm.city}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, city: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Country"
                value={memberForm.country}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, country: e.target.value }))
                }
                className={inputClass}
              />
              <input
                placeholder="Build tags (comma)"
                value={memberForm.buildTags}
                onChange={(e) =>
                  setMemberForm((f) => ({ ...f, buildTags: e.target.value }))
                }
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={
                !canWrite || busy || !memberForm.clubId || !memberForm.instagramHandle
              }
              onClick={() => void handleSaveMember()}
            >
              {t.admin.firestoreSaveMember}
            </Button>
          </div>
        </section>

        <p className="text-[10px] text-[#64748B]">{t.admin.firestoreCsvHint}</p>

        {message ? <p className="text-xs text-[#22C55E]">{message}</p> : null}
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </GlassPanel>
  );
}
