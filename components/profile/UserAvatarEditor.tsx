"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { User } from "firebase/auth";

import { UserAvatar } from "@/components/profile/UserAvatar";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  hasProviderAccountPhoto,
  hasUploadedShiftItAvatar,
} from "@/lib/auth/user-avatar";
import { formatBytes } from "@/lib/utils/format-bytes";
import {
  removeUserAvatar,
  uploadUserAvatar,
} from "@/lib/repositories/user-avatars";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserAvatarEditorProps = {
  uid: string;
  profile: UserProfile | null;
  authUser: User;
  onUpdated: () => Promise<void>;
};

export function UserAvatarEditor({
  uid,
  profile,
  authUser,
  onUpdated,
}: UserAvatarEditorProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canRemove = hasUploadedShiftItAvatar(profile);
  const hasProviderPhoto = hasProviderAccountPhoto(profile, authUser);

  const mapError = useCallback(
    (code: string) => {
      switch (code) {
        case "UNSUPPORTED_IMAGE_TYPE":
          return t.profile.invalidImageFile;
        case "IMAGE_TOO_LARGE":
        case "INVALID_IMAGE_FILE":
          return t.profile.imageTooLarge;
        default:
          return t.profile.uploadFailed;
      }
    },
    [t]
  );

  const handleFile = async (file: File | null) => {
    if (!file || busy) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    setProgress(0);
    try {
      await uploadUserAvatar({
        uid,
        file,
        onProgress: setProgress,
      });
      setSuccess(t.profile.profilePhotoUpdated);
      await onUpdated();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(mapError(msg));
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!canRemove || busy) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      await removeUserAvatar(uid);
      setSuccess(t.profile.profilePhotoRemoved);
      await onUpdated();
    } catch {
      setError(t.profile.uploadFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <UserAvatar profile={profile} authUser={authUser} size="lg" rounded="2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-xs leading-relaxed text-[#64748B]">
            {t.profile.avatarPublicHint}
          </p>
          <p className="text-[11px] text-[#64748B]">{t.profile.avatarRecommended}</p>

          <div
            role="button"
            tabIndex={busy ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onClick={() => !busy && inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition",
              "border-white/10 bg-[#151B24]/60 hover:border-white/20",
              busy && "pointer-events-none opacity-50"
            )}
          >
            <ImagePlus className="mb-2 size-6 text-[#64748B]" />
            <p className="text-xs text-[#94A3B8]">{t.profile.uploadAvatar}</p>
            <p className="mt-1 text-[10px] text-[#64748B]">
              JPEG, PNG, WebP · max {formatBytes(10 * 1024 * 1024)}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {busy ? (
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs text-[#94A3B8]">
                <Loader2 className="size-3.5 animate-spin" />
                {progress > 0 ? `${progress}%` : "…"}
              </p>
              {progress > 0 ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#3B82F6] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="text-xs text-[#F87171]" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-xs text-emerald-400/90" role="status">
              {success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/15 px-4 text-sm font-medium text-[#F8FAFC] hover:bg-[#EF4444]/25 disabled:opacity-50"
            >
              {t.profile.changePhoto}
            </button>
            {canRemove ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRemove()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#151B24]/80 px-4 text-sm text-[#CBD5E1] hover:text-[#F8FAFC] disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                {t.profile.removeUploadedPhoto}
              </button>
            ) : null}
          </div>

          {hasProviderPhoto && canRemove ? (
            <p className="text-[11px] text-[#64748B]">{t.profile.useAccountPhotoHint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
