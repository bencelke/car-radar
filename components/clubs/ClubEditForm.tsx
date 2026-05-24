"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import {
  updateClubDetails,
  type ClubDetailsPatch,
} from "@/lib/repositories/clubs";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubEditFormProps = {
  club: Club;
  onClubUpdate?: (club: Club) => void;
};

function csvToList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToCsv(list?: string[]): string {
  return list?.join(", ") ?? "";
}

export function ClubEditForm({ club, onClubUpdate }: ClubEditFormProps) {
  const { t } = useLocale();
  const { isAdmin, isDevAdminBypass } = useAuth();
  const canSaveFirebase =
    isAdmin && isFirebaseConfigured && !isDevAdminBypass;

  const [name, setName] = useState(club.name);
  const [shortDescription, setShortDescription] = useState(club.shortDescription ?? "");
  const [description, setDescription] = useState(club.description);
  const [city, setCity] = useState(club.city);
  const [area, setArea] = useState(club.area ?? "");
  const [country, setCountry] = useState(club.country);
  const [instagram, setInstagram] = useState(club.instagram ?? "");
  const [website, setWebsite] = useState(club.website ?? "");
  const [vehicleTypes, setVehicleTypes] = useState(listToCsv(club.vehicleTypes));
  const [primaryBrands, setPrimaryBrands] = useState(listToCsv(club.primaryBrands));
  const [joinRequirements, setJoinRequirements] = useState(
    club.joinRequirements ?? ""
  );
  const [meetingStyle, setMeetingStyle] = useState(club.meetingStyle ?? "");
  const [memberCount, setMemberCount] = useState(
    club.memberCount != null ? String(club.memberCount) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#151B24]/80 px-2.5 py-1.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6]/40 focus:outline-none";

  const handlePreview = () => {
    const updated: Club = {
      ...club,
      name,
      shortDescription: shortDescription || undefined,
      description,
      city,
      area: area || undefined,
      country,
      instagram: instagram || undefined,
      website: website || undefined,
      vehicleTypes: csvToList(vehicleTypes),
      primaryBrands: csvToList(primaryBrands),
      joinRequirements: joinRequirements || undefined,
      meetingStyle: meetingStyle || undefined,
      memberCount: memberCount ? Number(memberCount) : club.memberCount,
    };
    onClubUpdate?.(updated);
    setSuccess(true);
  };

  const handleSave = async () => {
    if (!canSaveFirebase) {
      handlePreview();
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const patch: ClubDetailsPatch = {
        name,
        shortDescription: shortDescription || undefined,
        description,
        city,
        area: area || undefined,
        country,
        instagram: instagram || undefined,
        website: website || undefined,
        vehicleTypes: csvToList(vehicleTypes),
        primaryBrands: csvToList(primaryBrands),
        joinRequirements: joinRequirements || undefined,
        meetingStyle: meetingStyle || undefined,
        memberCount: memberCount ? Number(memberCount) : undefined,
      };
      await updateClubDetails(club.id, patch);
      onClubUpdate?.({ ...club, ...patch });
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-heading text-xs font-semibold text-[#CBD5E1]">
        {t.clubs.editClubInformation}
      </p>
      {!canSaveFirebase ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[10px] leading-relaxed text-amber-100/80">
          {t.clubs.textEditsRequireFirebase.replace("{clubId}", club.id)}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.submit.clubName}
          </span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            Short description
          </span>
          <input
            className={inputClass}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            Description
          </span>
          <textarea
            className={cn(inputClass, "min-h-[4rem] resize-y")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.members.location}
          </span>
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.members.area}
          </span>
          <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.submit.country}
          </span>
          <input
            className={inputClass}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            Instagram
          </span>
          <input
            className={inputClass}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.common.website}
          </span>
          <input
            className={inputClass}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.clubs.vehicleTypes}
          </span>
          <input
            className={inputClass}
            value={vehicleTypes}
            onChange={(e) => setVehicleTypes(e.target.value)}
            placeholder="BMW, Audi, JDM"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.clubs.primaryBrands}
          </span>
          <input
            className={inputClass}
            value={primaryBrands}
            onChange={(e) => setPrimaryBrands(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.clubs.joinRequirements}
          </span>
          <textarea
            className={cn(inputClass, "min-h-[3rem] resize-y")}
            value={joinRequirements}
            onChange={(e) => setJoinRequirements(e.target.value)}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.clubs.meetingStyle}
          </span>
          <textarea
            className={cn(inputClass, "min-h-[2.5rem] resize-y")}
            value={meetingStyle}
            onChange={(e) => setMeetingStyle(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-[#64748B]">
            {t.clubs.members}
          </span>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={memberCount}
            onChange={(e) => setMemberCount(e.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="text-xs text-[#F87171]" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-xs text-emerald-400/90" role="status">
          {canSaveFirebase ? t.clubs.saveClubDetails : t.clubs.previewOnlyNote}
        </p>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSave()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-3 py-2 text-xs font-medium text-[#F8FAFC] hover:bg-[#3B82F6]/25 disabled:opacity-50"
      >
        {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {canSaveFirebase ? t.clubs.saveClubDetails : t.clubs.previewChanges}
      </button>
    </div>
  );
}
