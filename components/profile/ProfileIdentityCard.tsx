"use client";

import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  elevatedPanelClass,
  sectionHeadingClass,
  sectionSubtextClass,
  statusBadgeClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayNameFromUserLike } from "@/lib/auth/user-display";
import { normalizeUserInstagramInput } from "@/lib/auth/instagram-profile";
import { updateGarage } from "@/lib/repositories/garages";
import {
  updateUserInstagramProfile,
  updateUserProfileDisplayName,
} from "@/lib/repositories/users";
import type { ClubMember, GarageProfile, UserProfile } from "@/lib/types";
import { formatInstagramHandle } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

type ProfileIdentityCardProps = {
  userId: string;
  profile: UserProfile | null;
  garage: GarageProfile | null;
  claimedMember: ClubMember | null;
  onUpdated: () => Promise<void>;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]/40";

export function ProfileIdentityCard({
  userId,
  profile,
  garage,
  claimedMember,
  onUpdated,
  editing: editingProp,
  onEditingChange,
}: ProfileIdentityCardProps) {
  const { t } = useLocale();
  const [internalEditing, setInternalEditing] = useState(false);
  const editing = editingProp ?? internalEditing;
  const setEditing = onEditingChange ?? setInternalEditing;

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [instagramInput, setInstagramInput] = useState(
    profile?.instagramHandle ?? garage?.instagramHandle ?? ""
  );
  const [city, setCity] = useState(garage?.city ?? claimedMember?.city ?? "");
  const [area, setArea] = useState(garage?.area ?? "");
  const [country, setCountry] = useState(
    garage?.country ?? claimedMember?.country ?? ""
  );
  const [visibility, setVisibility] = useState<GarageProfile["visibility"]>(
    garage?.visibility ?? "public"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
    setInstagramInput(profile?.instagramHandle ?? garage?.instagramHandle ?? "");
    setCity(garage?.city ?? claimedMember?.city ?? "");
    setArea(garage?.area ?? "");
    setCountry(garage?.country ?? claimedMember?.country ?? "");
    setVisibility(garage?.visibility ?? "public");
  }, [garage, profile, claimedMember]);

  const clubName = garage?.clubName ?? claimedMember?.clubName;
  const instagramHandle = profile?.instagramHandle ?? garage?.instagramHandle;
  const verification = profile?.instagramVerificationStatus;
  const savedDisplayName = displayNameFromUserLike(profile, null);

  async function handleSave() {
    setError(null);
    setSaved(false);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError(t.garage.validation.displayNameRequired);
      return;
    }
    if (trimmedName.length < 2) {
      setError(t.garage.validation.displayNameTooShort);
      return;
    }
    if (trimmedName.length > 50) {
      setError(t.garage.validation.displayNameTooLong);
      return;
    }

    const normalized = normalizeUserInstagramInput(instagramInput);
    if (instagramInput.trim() && !normalized) {
      setError(t.auth.instagramInvalidHandle);
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileDisplayName(userId, trimmedName);

      try {
        if (auth?.currentUser) {
          await updateProfile(auth.currentUser, { displayName: trimmedName });
        }
      } catch {
        /* Firestore name is primary; Auth sync is best-effort */
      }

      if (normalized) {
        await updateUserInstagramProfile(
          userId,
          normalized.handle,
          normalized.url
        );
      }
      if (garage) {
        await updateGarage(userId, {
          city: city.trim() || undefined,
          area: area.trim() || undefined,
          country: country.trim() || undefined,
          visibility,
        });
      }
      setSaved(true);
      setEditing(false);
      await onUpdated();
    } catch {
      setError(t.profile.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const visibilityLabel = {
    public: t.garage.public,
    club_only: t.garage.clubOnly,
    private: t.garage.private,
  };

  return (
    <section className={cn(elevatedPanelClass, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={sectionHeadingClass}>{t.profile.profileIdentity}</h2>
          <p className={sectionSubtextClass}>{t.profile.profileIdentityHint}</p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 text-xs font-medium text-[#3B82F6] hover:underline"
          >
            {t.profile.editProfile}
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {t.profile.displayName}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
            <p className="mt-1 text-[10px] text-[#64748B]">
              {t.profile.displayNameHint}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {t.auth.instagramProfile}
            </label>
            <input
              type="text"
              value={instagramInput}
              onChange={(e) => setInstagramInput(e.target.value)}
              placeholder="@yourhandle"
              className={inputClass}
            />
            <p className="mt-1 text-[10px] text-[#64748B]">
              {t.profile.instagramEditHelper}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {t.garage.city}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
                disabled={!garage}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {t.garage.area}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={inputClass}
                disabled={!garage}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {t.garage.country}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
              disabled={!garage}
            />
          </div>
          {garage ? (
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {t.garage.visibility}
              </label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as GarageProfile["visibility"])
                }
                className={inputClass}
              >
                <option value="public">{t.garage.public}</option>
                <option value="club_only">{t.garage.clubOnly}</option>
                <option value="private">{t.garage.private}</option>
              </select>
            </div>
          ) : null}
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
          {saved ? (
            <p className="text-xs text-emerald-400/90">{t.profile.profileUpdated}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#EF4444]/45 bg-gradient-to-r from-[#EF4444]/25 to-[#A855F7]/20 px-4 text-sm font-medium text-[#F8FAFC] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t.profile.saveChanges
              )}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="inline-flex min-h-11 items-center rounded-xl border border-white/[0.1] px-4 text-sm text-[#CBD5E1]"
            >
              {t.garage.cancel}
            </button>
          </div>
        </div>
      ) : (
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.profile.displayName}</dt>
            <dd className="text-right font-medium text-[#E2E8F0]">
              {savedDisplayName || "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.auth.instagramProfile}</dt>
            <dd className="text-right">
              {instagramHandle ? (
                <span className="inline-flex flex-wrap items-center justify-end gap-2">
                  <a
                    href={`https://instagram.com/${instagramHandle.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#E2E8F0] hover:text-[#F8FAFC]"
                  >
                    {formatInstagramHandle(instagramHandle)}
                  </a>
                  {verification !== "verified" ? (
                    <span
                      className={cn(
                        statusBadgeClass,
                        "border-amber-500/30 bg-amber-500/10 text-amber-200/90"
                      )}
                    >
                      {t.profile.unverified}
                    </span>
                  ) : null}
                  <a
                    href={`https://instagram.com/${instagramHandle.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B82F6] hover:underline"
                  >
                    <ExternalLink className="inline size-3.5" />
                  </a>
                </span>
              ) : (
                <span className="text-[#64748B]">{t.profile.notAdded}</span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.garage.city}</dt>
            <dd className="text-right text-[#E2E8F0]">{city || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.garage.area}</dt>
            <dd className="text-right text-[#E2E8F0]">{area || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.garage.country}</dt>
            <dd className="text-right text-[#E2E8F0]">{country || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
            <dt className="text-[#64748B]">{t.profile.clubAffiliation}</dt>
            <dd className="text-right text-[#E2E8F0]">{clubName || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#64748B]">{t.profile.publicProfile}</dt>
            <dd className="text-right text-[#E2E8F0]">
              {garage ? visibilityLabel[visibility] : "—"}
            </dd>
          </div>
        </dl>
      )}

      {!garage && !editing ? (
        <Link
          href="/garage"
          className="mt-4 inline-flex text-xs font-medium text-[#3B82F6] hover:underline"
        >
          {t.profile.createMyGarage}
        </Link>
      ) : null}

      {!editing && instagramHandle ? (
        <p className="mt-4 text-[11px] text-[#64748B]">
          {t.profile.instagramPublicHelper}
        </p>
      ) : null}
    </section>
  );
}
