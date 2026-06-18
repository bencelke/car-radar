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
  buildClubFromDetails,
  parseCommaList,
} from "@/lib/import/club-member-import";
import { prepareClubForFirestore } from "@/lib/import/firestore-club-import";
import { getClubsForAdmin } from "@/lib/repositories/admin-data";
import { createOrUpdateClub, updateClubDetails } from "@/lib/repositories/clubs";
import type { Club, ListingStatus } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";

const fieldClass =
  "h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]";
const labelClass = "mb-1 block text-[10px] uppercase tracking-wider text-[#64748B]";

const emptyForm = {
  clubId: "",
  name: "",
  city: "",
  country: "Germany",
  area: "",
  description: "",
  shortDescription: "",
  instagram: "",
  website: "",
  joinRequirements: "",
  meetingStyle: "",
  vehicleTypes: "",
  primaryBrands: "",
  lat: "",
  lng: "",
  status: "approved" as ListingStatus,
};

export function AdminClubsPanel() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { blocked, AdminGuardFallback } = useAdminGuard();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadClubs = useCallback(async () => {
    setLoading(true);
    const list = await getClubsForAdmin();
    setClubs(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadClubs();
  }, [loadClubs]);

  if (blocked) return <AdminGuardFallback />;

  const actor = user ? { uid: user.uid } : null;
  const canWrite = isFirebaseConfigured && Boolean(actor);

  function applyClub(club: Club) {
    setSelectedClub(club);
    setForm({
      clubId: club.id,
      name: club.name,
      city: club.city,
      country: club.country,
      area: club.area ?? "",
      description: club.description ?? "",
      shortDescription: club.shortDescription ?? "",
      instagram: club.instagram ?? club.contactInstagram ?? "",
      website: club.website ?? "",
      joinRequirements: club.joinRequirements ?? "",
      meetingStyle: club.meetingStyle ?? "",
      vehicleTypes: (club.vehicleTypes ?? []).join(", "),
      primaryBrands: (club.primaryBrands ?? []).join(", "),
      lat: club.lat?.toString() ?? "",
      lng: club.lng?.toString() ?? "",
      status: club.status,
    });
  }

  async function handleSave() {
    if (!actor) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const clubId = form.clubId.trim().toLowerCase();
      if (!clubId || !form.name.trim()) {
        throw new Error(t.admin.clubIdNameRequired);
      }

      const club = buildClubFromDetails(
        {
          clubId,
          clubName: form.name,
          city: form.city,
          country: form.country,
          area: form.area,
          description: form.description,
          instagram: form.instagram,
          website: form.website,
          vehicleTypes: form.vehicleTypes,
          primaryBrands: form.primaryBrands,
          tags: "",
        },
        0
      );

      const payload: Club = {
        ...club,
        status: form.status,
        shortDescription: form.shortDescription || undefined,
        joinRequirements: form.joinRequirements || undefined,
        meetingStyle: form.meetingStyle || undefined,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        vehicleTypes: parseCommaList(form.vehicleTypes),
        primaryBrands: parseCommaList(form.primaryBrands),
      };

      if (selectedClub) {
        await updateClubDetails(clubId, payload, actor);
      } else {
        await createOrUpdateClub(prepareClubForFirestore(payload, actor), actor);
      }

      setMessage(t.admin.clubSaved);
      await loadClubs();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <GlassPanel>
        <PanelHeader title={t.admin.clubsListTitle} />
        <div className="max-h-[420px] space-y-1 overflow-y-auto p-3 pt-0">
          {loading ? (
            <Loader2 className="mx-auto size-5 animate-spin text-[#64748B]" />
          ) : (
            clubs.map((club) => (
              <button
                key={club.id}
                type="button"
                onClick={() => applyClub(club)}
                className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left text-sm transition hover:border-white/[0.08] hover:bg-white/[0.03]"
              >
                <span className="truncate text-[#F8FAFC]">{club.name}</span>
                <span className="ml-2 shrink-0 text-[10px] text-[#64748B]">
                  {club.status}
                </span>
              </button>
            ))
          )}
        </div>
      </GlassPanel>

      <GlassPanel>
        <PanelHeader
          title={selectedClub ? t.admin.editClub : t.admin.addClub}
        />
        <div className="space-y-3 p-4 pt-0">
          {!canWrite ? (
            <p className="text-sm text-amber-200/90">{t.admin.firestoreNotConfigured}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>ID</label>
              <input
                value={form.clubId}
                disabled={Boolean(selectedClub)}
                onChange={(e) => setForm((f) => ({ ...f, clubId: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t.common.name}</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={fieldClass}
              />
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
              <label className={labelClass}>{t.common.location}</label>
              <input
                value={form.area}
                onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as ListingStatus,
                  }))
                }
                className={fieldClass}
              >
                <option value="draft">draft</option>
                <option value="approved">approved</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Lat / Lng</label>
              <div className="flex gap-2">
                <input
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  className={fieldClass}
                  placeholder="Lat"
                />
                <input
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  className={fieldClass}
                  placeholder="Lng"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t.common.description}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${fieldClass} min-h-[72px] py-2`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t.admin.joinRequirements}</label>
              <textarea
                rows={2}
                value={form.joinRequirements}
                onChange={(e) =>
                  setForm((f) => ({ ...f, joinRequirements: e.target.value }))
                }
                className={`${fieldClass} min-h-[56px] py-2`}
              />
            </div>
            <div>
              <label className={labelClass}>{t.admin.meetingStyle}</label>
              <textarea
                rows={2}
                value={form.meetingStyle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meetingStyle: e.target.value }))
                }
                className={`${fieldClass} min-h-[56px] py-2`}
              />
            </div>
          </div>

          {selectedClub ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#0B1118]/60 p-3">
              <p className="mb-2 text-xs font-semibold text-[#CBD5E1]">
                {t.admin.uploadCover}
              </p>
              <ProfileImageUploader
                ownerType="club"
                ownerId={selectedClub.id}
                baseClub={selectedClub}
                clubImageKind="cover"
                imageKind="club_cover"
                currentImageUrl={selectedClub.coverImageUrl ?? selectedClub.imageUrl}
                onUploaded={() => void loadClubs()}
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
              {busy ? <Loader2 className="size-4 animate-spin" /> : t.admin.saveClub}
            </Button>
            {selectedClub ? (
              <Link
                href={clubDetailPath(selectedClub)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs text-[#CBD5E1] hover:text-[#F8FAFC]"
              >
                <ExternalLink className="size-3.5" />
                {t.admin.viewPublicClub}
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="min-h-11 border-white/[0.08]"
              onClick={() => {
                setSelectedClub(null);
                setForm(emptyForm);
              }}
            >
              {t.admin.addClub}
            </Button>
          </div>

          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
      </GlassPanel>
    </div>
  );
}
