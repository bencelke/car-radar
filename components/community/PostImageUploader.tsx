"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import {
  extensionFromMime,
  optimizeProfileImage,
  type OptimizeProfileImageResult,
} from "@/lib/images/optimize-client-image";
import { formatBytes } from "@/lib/utils/format-bytes";
import {
  isFirebaseStorageConfigured,
  uploadCommunityPostImage,
} from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";

export type PostImageValue = {
  imageUrl: string;
  imageStoragePath: string;
  imageWidth?: number;
  imageHeight?: number;
  imageSizeBytes?: number;
  imageContentType?: string;
};

type PostImageUploaderProps = {
  contextType: "club" | "event";
  contextId: string;
  postId: string;
  value?: PostImageValue | null;
  onChange: (value: PostImageValue | null) => void;
  disabled?: boolean;
};

export function PostImageUploader({
  contextType,
  contextId,
  postId,
  value,
  onChange,
  disabled,
}: PostImageUploaderProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value?.imageUrl ?? "");
  const [stats, setStats] = useState<OptimizeProfileImageResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!isFirebaseStorageConfigured()) {
      setError(t.garage.storageRequired);
      return;
    }
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const optimized = await optimizeProfileImage(file, { kind: "community_post" });
      setStats(optimized);
      setPreview(optimized.previewUrl);

      const ext = extensionFromMime(optimized.outputMimeType);
      const uploaded = await uploadCommunityPostImage({
        file: optimized.file,
        contextType,
        contextId,
        postId,
        fileExtension: ext,
        onProgress: setProgress,
      });

      onChange({
        imageUrl: uploaded.downloadUrl,
        imageStoragePath: uploaded.storagePath,
        imageWidth: optimized.width,
        imageHeight: optimized.height,
        imageSizeBytes: uploaded.sizeBytes,
        imageContentType: uploaded.contentType,
      });
      setPreview(uploaded.downloadUrl);
    } catch {
      setError(t.garage.uploadFailed);
    } finally {
      setBusy(false);
    }
  }

  function clearImage() {
    setPreview("");
    setStats(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#151B24]/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-56 w-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            disabled={disabled || busy}
            className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-lg bg-black/60 text-[#F8FAFC]"
            aria-label={t.communityPosts.cancel}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-[#151B24]/40 px-3 text-sm text-[#94A3B8] transition hover:border-[#3B82F6]/35 hover:text-[#CBD5E1]"
          )}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {t.communityPosts.addPhoto}
        </button>
      )}

      {stats ? (
        <p className="text-[11px] text-[#64748B]">
          {t.communityPosts.imageOptimized} · {t.communityPosts.originalSize}{" "}
          {formatBytes(stats.originalSizeBytes)} · {t.communityPosts.optimizedSize}{" "}
          {formatBytes(stats.optimizedSizeBytes)}
        </p>
      ) : null}

      {busy && progress > 0 ? (
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full bg-[#3B82F6] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
