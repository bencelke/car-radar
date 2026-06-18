"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, Save } from "lucide-react";

import { CompactImagePreview } from "@/components/images/CompactImagePreview";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { downloadOptimizedImage } from "@/lib/images/download-optimized-image";
import {
  extensionFromMime,
  getOptimizeOptionsForKind,
  optimizeProfileImage,
  type OptimizeProfileImageResult,
  type ProfileImageKind,
} from "@/lib/images/optimize-client-image";
import { resolveDownloadFileName } from "@/lib/images/resolve-download-filename";
import {
  isFirebaseStorageConfigured,
  uploadProfileImage,
  type ProfileImageOwnerType,
  type UploadProfileImageResult,
} from "@/lib/firebase/storage";
import type { ClubDevImageKind } from "@/lib/clubs/club-image-path";
import { updateClubMemberImage } from "@/lib/repositories/club-members";
import { updateClubImage } from "@/lib/repositories/clubs";
import { updateUserProfileImage } from "@/lib/repositories/users";
import { memberAvatarGradient } from "@/lib/members/roles";
import { memberAvatarInitial } from "@/lib/utils/instagram";
import type { Club, ClubMember } from "@/lib/types";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { formatBytes } from "@/lib/utils/format-bytes";
import { cn } from "@/lib/utils";

export type ProfileImageUploadMode = "firebase" | "local-download" | "local-save";

export type ProfileImageUploadedPayload = {
  avatarUrl: string;
  imageUrl: string;
  coverImageUrl?: string;
  logoUrl?: string;
  storagePath?: string;
  sizeBytes?: number;
  contentType?: string;
  publicPath?: string;
  localSave?: boolean;
} & Partial<UploadProfileImageResult>;

type ProfileImageUploaderProps = {
  mode?: ProfileImageUploadMode;
  ownerType: ProfileImageOwnerType;
  ownerId: string;
  clubId?: string;
  memberId?: string;
  currentImageUrl?: string;
  memberPreview?: ClubMember;
  baseMember?: ClubMember;
  baseClub?: Club;
  clubImageKind?: ClubDevImageKind;
  imageKind?: ProfileImageKind;
  suggestedFileName?: string;
  expectedPublicPath?: string;
  compactPreview?: boolean;
  localSaveButtonLabel?: string;
  localSaveSuccessLabel?: string;
  onUploaded?: (result: ProfileImageUploadedPayload) => void;
  disabled?: boolean;
};

export function ProfileImageUploader({
  mode = "firebase",
  ownerType,
  ownerId,
  clubId,
  memberId,
  currentImageUrl,
  memberPreview,
  baseMember,
  baseClub,
  clubImageKind = "cover",
  imageKind: imageKindProp,
  suggestedFileName,
  expectedPublicPath,
  compactPreview = false,
  localSaveButtonLabel,
  localSaveSuccessLabel,
  onUploaded,
  disabled = false,
}: ProfileImageUploaderProps) {
  const { t } = useLocale();
  const isClub = ownerType === "club";
  const resolvedImageKind: ProfileImageKind =
    imageKindProp ??
    (ownerType === "member"
      ? "member_car"
      : isClub
        ? clubImageKind === "logo"
          ? "club_logo"
          : "club_cover"
        : "avatar");
  const isLocalDownload = mode === "local-download";
  const isLocalSave = mode === "local-save";
  const isLocalDev = isLocalDownload || isLocalSave;
  const useCompact =
    compactPreview ||
    isLocalDev ||
    (ownerType === "member" && resolvedImageKind === "member_car") ||
    isClub;

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savedPublicPath, setSavedPublicPath] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimized, setOptimized] = useState<OptimizeProfileImageResult | null>(null);
  const [displayUrl, setDisplayUrl] = useState(currentImageUrl ?? "");

  const isMemberCar = ownerType === "member" && resolvedImageKind === "member_car";
  const isClubCover = isClub && clubImageKind === "cover";
  const pickLabel = isClubCover
    ? t.clubs.uploadClubCover
    : isMemberCar
      ? displayUrl && !isLocalDev
        ? t.profileImages.replacePhoto
        : t.profileImages.uploadCarPhoto
      : t.profileImages.uploadTitle;

  const panelTitle = isClubCover
    ? t.clubs.clubCoverImage
    : isLocalSave
      ? t.profileImages.localOptimizerTitle
      : isLocalDownload
        ? t.profileImages.localOptimizerTitle
        : isMemberCar
          ? t.profileImages.adminUploadTitle
          : t.profileImages.uploadTitle;

  const panelSubtitle = isClubCover
    ? isLocalSave
      ? t.clubs.localClubImageSaveHelper
      : t.profileImages.memberPhotoHint
    : isLocalSave
      ? t.profileImages.localSaveHelper
      : isLocalDownload
        ? t.profileImages.localOptimizerHelper
        : isMemberCar
          ? t.profileImages.memberPhotoHint
          : t.profileImages.helperText;

  const previewMember: ClubMember =
    memberPreview ??
    ({
      id: ownerId,
      clubId: clubId ?? "",
      displayName: "?",
      status: "approved",
      city: "",
      country: "",
    } as ClubMember);

  const previewInitial = memberAvatarInitial(previewMember);
  const previewGradient = memberAvatarGradient(previewMember);

  useEffect(() => {
    setDisplayUrl(currentImageUrl ?? "");
  }, [currentImageUrl]);

  useEffect(() => {
    return () => {
      if (optimized?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(optimized.previewUrl);
      }
    };
  }, [optimized]);

  const revokeOptimizedPreview = useCallback((result: OptimizeProfileImageResult | null) => {
    if (result?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(result.previewUrl);
    }
  }, []);

  const mapError = useCallback(
    (code: string) => {
      switch (code) {
        case "UNSUPPORTED_IMAGE_TYPE":
          return t.profileImages.unsupportedType;
        case "IMAGE_TOO_LARGE":
          return t.profileImages.tooLarge;
        case "FIREBASE_STORAGE_NOT_CONFIGURED":
          return t.profileImages.storageNotConfigured;
        case "FIREBASE_NOT_CONFIGURED":
          return t.auth.firebaseRequired;
        default:
          return code;
      }
    },
    [t]
  );

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccessMessage(null);
      setSavedPublicPath(null);
      revokeOptimizedPreview(optimized);
      setOptimized(null);
      setOptimizing(true);
      try {
        const result = await optimizeProfileImage(file, {
          ...getOptimizeOptionsForKind(resolvedImageKind),
          kind: resolvedImageKind,
        });
        setOptimized(result);
        if (useCompact) {
          setDisplayUrl(result.previewUrl);
        } else {
          setDisplayUrl(result.previewUrl);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(mapError(msg));
      } finally {
        setOptimizing(false);
      }
    },
    [resolvedImageKind, mapError, optimized, revokeOptimizedPreview, useCompact]
  );

  const onFileChange = (file: File | null) => {
    if (!file || disabled) return;
    void processFile(file);
  };

  const handleDownload = () => {
    if (!optimized) return;
    const fileName = resolveDownloadFileName(
      suggestedFileName,
      optimized.outputMimeType
    );
    downloadOptimizedImage(optimized.file, fileName);
  };

  const handleLocalSave = async () => {
    if (!optimized || disabled || uploading) return;

    setError(null);
    setSuccessMessage(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", optimized.file, optimized.file.name);

      let endpoint = "/api/dev/save-member-image";
      if (isClub) {
        formData.append("clubId", ownerId);
        formData.append("imageKind", clubImageKind);
        endpoint = "/api/dev/save-club-image";
      } else {
        const resolvedClubId = clubId?.trim();
        const resolvedMemberId = memberId?.trim() || ownerId;
        if (!resolvedClubId) {
          setError("Missing clubId");
          setUploading(false);
          return;
        }
        formData.append("clubId", resolvedClubId);
        formData.append("memberId", resolvedMemberId);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        publicPath?: string;
        sizeBytes?: number;
        error?: string;
      };

      if (!res.ok || !data.publicPath) {
        throw new Error(data.error ?? "Save failed");
      }

      const busted = `${data.publicPath}?v=${Date.now()}`;
      revokeOptimizedPreview(optimized);
      setOptimized(null);
      setDisplayUrl(busted);
      setSavedPublicPath(data.publicPath);
      setSuccessMessage(
        localSaveSuccessLabel ??
          (isClub ? t.clubs.localClubCoverSaved : t.profileImages.savedLocally)
      );

      onUploaded?.({
        avatarUrl: busted,
        imageUrl: busted,
        coverImageUrl: isClub && clubImageKind === "cover" ? busted : undefined,
        logoUrl: isClub && clubImageKind === "logo" ? busted : undefined,
        publicPath: data.publicPath,
        sizeBytes: data.sizeBytes,
        contentType: optimized.outputMimeType,
        localSave: true,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(mapError(msg));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!optimized || disabled || uploading || isLocalDev) return;
    setError(null);

    if (!isFirebaseConfigured) {
      setError(t.auth.firebaseRequired);
      return;
    }
    if (!isFirebaseStorageConfigured()) {
      setError(t.profileImages.storageNotConfigured);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const ext = extensionFromMime(optimized.outputMimeType);
      const uploaded = await uploadProfileImage({
        file: optimized.file,
        ownerType,
        ownerId,
        fileExtension: ext,
        clubImageKind: isClub ? clubImageKind : undefined,
        clubId: ownerType === "member" ? clubId : undefined,
        memberId: ownerType === "member" ? (memberId ?? ownerId) : undefined,
        onProgress: setProgress,
      });

      const now = new Date().toISOString();
      const imageMeta = {
        imageStoragePath: uploaded.storagePath,
        imageUpdatedAt: now,
        imageSizeBytes: uploaded.sizeBytes,
        imageContentType: uploaded.contentType,
      };

      if (ownerType === "user") {
        await updateUserProfileImage(ownerId, {
          avatarUrl: uploaded.downloadUrl,
          imageUrl: uploaded.downloadUrl,
          ...imageMeta,
        });
      } else if (isClub) {
        const url = uploaded.downloadUrl;
        await updateClubImage(
          ownerId,
          clubImageKind,
          {
            coverImageUrl: clubImageKind === "cover" ? url : undefined,
            logoUrl: clubImageKind === "logo" ? url : undefined,
            imageUrl: clubImageKind === "cover" ? url : undefined,
            ...imageMeta,
          },
          baseClub
        );
      } else {
        await updateClubMemberImage(
          ownerId,
          {
            avatarUrl: uploaded.downloadUrl,
            imageUrl: uploaded.downloadUrl,
            ...imageMeta,
          },
          baseMember ?? memberPreview
        );
      }

      revokeOptimizedPreview(optimized);
      setOptimized(null);
      setDisplayUrl(uploaded.downloadUrl);
      onUploaded?.({
        ...uploaded,
        avatarUrl: uploaded.downloadUrl,
        imageUrl: uploaded.downloadUrl,
        coverImageUrl:
          isClub && clubImageKind === "cover" ? uploaded.downloadUrl : undefined,
        logoUrl: isClub && clubImageKind === "logo" ? uploaded.downloadUrl : undefined,
        storagePath: uploaded.storagePath,
        sizeBytes: uploaded.sizeBytes,
        contentType: uploaded.contentType,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(mapError(msg));
    } finally {
      setUploading(false);
    }
  };

  const savedPercent =
    optimized && optimized.compressionRatio > 0
      ? Math.round(optimized.compressionRatio * 100)
      : null;

  const outputMimeLabel = optimized?.outputMimeType ?? "";
  const previewSrc = optimized?.previewUrl ?? (displayUrl || undefined);
  const previewAlt = isMemberCar
    ? previewMember.displayName
    : isClub
      ? baseClub?.name ?? t.clubs.clubCoverImage
      : t.profileImages.compactPreview;

  const dropzone = (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        onFileChange(e.dataTransfer.files?.[0] ?? null);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition",
        dragOver
          ? "border-[#3B82F6]/50 bg-[#3B82F6]/10"
          : "border-white/10 bg-[#151B24]/60 hover:border-white/20",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <ImagePlus className="mb-2 size-6 text-[#64748B]" />
      <p className="text-xs text-[#94A3B8]">{pickLabel}</p>
      <p className="mt-1 text-[10px] text-[#64748B]">JPEG, PNG, WebP · max 8 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );

  const statsBlock = optimized ? (
    <dl className="grid grid-cols-2 gap-2 text-[11px]">
      <div>
        <dt className="text-[#64748B]">{t.profileImages.originalSize}</dt>
        <dd className="font-medium text-[#CBD5E1]">
          {formatBytes(optimized.originalSizeBytes)}
        </dd>
      </div>
      <div>
        <dt className="text-[#64748B]">{t.profileImages.optimizedSize}</dt>
        <dd className="font-medium text-[#CBD5E1]">
          {formatBytes(optimized.optimizedSizeBytes)}
        </dd>
      </div>
      {savedPercent != null && savedPercent > 0 ? (
        <div className="col-span-2">
          <dt className="text-[#64748B]">{t.profileImages.saved}</dt>
          <dd className="font-medium text-emerald-400/90">{savedPercent}%</dd>
        </div>
      ) : null}
      {isLocalDev && outputMimeLabel ? (
        <div className="col-span-2">
          <dt className="text-[#64748B]">MIME</dt>
          <dd className="font-medium text-[#CBD5E1]">{outputMimeLabel}</dd>
        </div>
      ) : null}
    </dl>
  ) : null;

  const actionButtons = isLocalSave ? (
    <>
      <button
        type="button"
        disabled={!optimized || optimizing || uploading || disabled}
        onClick={() => void handleLocalSave()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
                {localSaveButtonLabel ?? t.profileImages.saveLocally}
      </button>
      {successMessage ? (
        <p className="mt-2 text-xs text-emerald-400/90" role="status">
          {successMessage}
          {savedPublicPath ? (
            <span className="mt-1 block font-mono text-[10px] text-[#94A3B8]">
              {savedPublicPath}
            </span>
          ) : null}
        </p>
      ) : null}
      <p className="mt-2 text-[10px] leading-relaxed text-[#64748B]">
        {t.profileImages.localSavedRefreshHint}
      </p>
    </>
  ) : isLocalDownload ? (
    <>
      <button
        type="button"
        disabled={!optimized || optimizing || disabled}
        onClick={handleDownload}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="size-4" />
        {t.profileImages.downloadOptimized}
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-[#64748B]">
        {t.profileImages.afterDownloadNote}
      </p>
    </>
  ) : (
    <button
      type="button"
      disabled={!optimized || optimizing || uploading || disabled}
      onClick={() => void handleUpload()}
      className="mt-4 w-full rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/20 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] transition hover:bg-[#EF4444]/30 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {uploading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {t.profileImages.uploadProgress}
        </span>
      ) : (
        t.profileImages.optimizeUpload
      )}
    </button>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border bg-[#0B1118]/90 p-5 backdrop-blur-xl",
        isLocalDev
          ? "border-amber-500/25 shadow-[0_0_32px_-12px_rgba(245,158,11,0.35)]"
          : "border-white/[0.08]"
      )}
    >
      {isLocalDev ? (
        <span className="mb-2 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
          {t.profileImages.localDevSaveBadge}
        </span>
      ) : null}

      <h3 className="font-heading text-sm font-semibold text-[#F8FAFC]">{panelTitle}</h3>
      <p className="mt-1 text-xs text-[#64748B]">{panelSubtitle}</p>

      {isLocalSave ? (
        <p className="mt-2 text-[11px] text-amber-200/70">{t.profileImages.localModeNote}</p>
      ) : null}

      {isLocalDev && expectedPublicPath ? (
        <p className="mt-3 rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#94A3B8]">
          <span className="text-[#64748B]">{t.profileImages.expectedPath}: </span>
          {expectedPublicPath}
        </p>
      ) : null}

      <div className="mt-4">
        {useCompact ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                {optimized
                  ? t.profileImages.compactPreview
                  : displayUrl
                    ? t.profileImages.currentPhoto
                    : t.profileImages.compactPreview}
              </p>
              <CompactImagePreview
                src={previewSrc}
                alt={previewAlt}
                placeholderInitial={
                  isClub ? baseClub?.name?.slice(0, 1) ?? "C" : previewInitial
                }
                placeholderGradient={previewGradient}
                size="sm"
                className={
                  isClub
                    ? "aspect-[2/1] h-auto w-full max-w-[200px] sm:max-w-[220px]"
                    : undefined
                }
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              {dropzone}
              {optimizing ? (
                <p className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <Loader2 className="size-3.5 animate-spin" />
                  …
                </p>
              ) : null}
              {statsBlock}
              {uploading && !isLocalSave ? (
                <div>
                  <p className="mb-1 text-[10px] text-[#64748B]">
                    {t.profileImages.uploadProgress} · {progress}%
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#3B82F6] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
              {error ? (
                <p className="text-xs text-[#F87171]" role="alert">
                  {error}
                </p>
              ) : null}
              {actionButtons}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center sm:justify-start">
              <MemberAvatar
                member={{ ...previewMember, avatarUrl: displayUrl, imageUrl: displayUrl }}
                size="lg"
              />
            </div>
            {dropzone}
            {optimizing ? (
              <p className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Loader2 className="size-3.5 animate-spin" />
                …
              </p>
            ) : null}
            {statsBlock}
            {error ? (
              <p className="text-xs text-[#F87171]" role="alert">
                {error}
              </p>
            ) : null}
            {actionButtons}
          </div>
        )}
      </div>
    </div>
  );
}
