"use client";

import { useEffect, useState } from "react";

import { ProfileImageUploader } from "@/components/images/ProfileImageUploader";
import type { ProfileImageUploadedPayload } from "@/components/images/ProfileImageUploader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  clubCoverUrl,
  clubImagePublicDiskPath,
} from "@/lib/clubs/club-image-path";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { isFirebaseStorageConfigured } from "@/lib/firebase/storage";
import { withImageCacheBust } from "@/lib/members/member-local-image-url";
import type { Club } from "@/lib/types";

const isDev = process.env.NODE_ENV === "development";

type ClubImageToolsProps = {
  club: Club;
  coverSrc?: string;
  onClubUpdate?: (club: Club) => void;
  onCoverSaved?: (bustedUrl: string) => void;
};

export function ClubImageTools({
  club,
  coverSrc,
  onClubUpdate,
  onCoverSaved,
}: ClubImageToolsProps) {
  const { t } = useLocale();
  const { isAdmin, isDevAdminBypass } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(coverSrc ?? clubCoverUrl(club) ?? "");
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const canFirebaseUpload =
    isAdmin &&
    isFirebaseConfigured &&
    isFirebaseStorageConfigured() &&
    !isDevAdminBypass;

  const showLocalSave = isDev && !canFirebaseUpload;

  useEffect(() => {
    setPreviewUrl(coverSrc ?? clubCoverUrl(club) ?? "");
  }, [coverSrc, club.coverImageUrl, club.imageUrl, club.logoUrl]);

  if (!showLocalSave && !canFirebaseUpload) return null;

  const handleUploaded = (result: ProfileImageUploadedPayload) => {
    const base =
      result.publicPath ??
      result.coverImageUrl?.split("?")[0] ??
      result.imageUrl?.split("?")[0] ??
      "";
    const busted = result.localSave
      ? withImageCacheBust(base || result.coverImageUrl || result.imageUrl || "")
      : result.coverImageUrl ?? result.imageUrl ?? base;

    const updated: Club = {
      ...club,
      coverImageUrl: base || busted.split("?")[0],
      imageUrl: base || busted.split("?")[0],
    };

    setPreviewUrl(busted);
    setSavedPath(base || null);
    onCoverSaved?.(busted);
    onClubUpdate?.(updated);
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        {t.clubs.clubPhoto}
      </p>
      {savedPath ? (
        <p className="text-[10px] font-medium text-[#22C55E]">{t.clubs.savedLocally}</p>
      ) : null}
      {savedPath ? (
        <p className="text-[10px] text-[#64748B]">{t.clubs.clubImageUpdatedHint}</p>
      ) : null}
      <ProfileImageUploader
        mode={showLocalSave ? "local-save" : "firebase"}
        ownerType="club"
        ownerId={club.id}
        baseClub={club}
        clubImageKind="cover"
        currentImageUrl={previewUrl}
        expectedPublicPath={clubImagePublicDiskPath(club, "cover")}
        suggestedFileName="cover.webp"
        compactPreview
        localSaveButtonLabel={t.clubs.saveCoverLocally}
        localSaveSuccessLabel={t.clubs.localClubCoverSaved}
        onUploaded={handleUploaded}
      />
      {savedPath ? (
        <p className="break-all font-mono text-[9px] text-[#64748B]">{savedPath}</p>
      ) : null}
    </div>
  );
}
