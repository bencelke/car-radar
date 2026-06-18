"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { garageInputClass } from "@/components/garage/garage-form";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  extensionFromMime,
  optimizeProfileImage,
  type OptimizeProfileImageResult,
} from "@/lib/images/optimize-client-image";
import { formatBytes } from "@/lib/utils/format-bytes";
import {
  isFirebaseStorageConfigured,
  uploadGarageCarImage,
} from "@/lib/firebase/storage";
import { updateGarageCarImage } from "@/lib/repositories/garage-cars";
import { cn } from "@/lib/utils";

type GaragePhotoStepProps = {
  ownerUid: string;
  carId: string;
  currentImageUrl?: string;
  onPhotoUrlChange: (url: string) => void;
  disabled?: boolean;
};

export function GaragePhotoStep({
  ownerUid,
  carId,
  currentImageUrl,
  onPhotoUrlChange,
  disabled,
}: GaragePhotoStepProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImageUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<OptimizeProfileImageResult | null>(
    null
  );

  const upload = useCallback(
    async (file: File) => {
      if (!isFirebaseStorageConfigured()) {
        setError(t.garage.storageRequired);
        return;
      }
      setBusy(true);
      setOptimizing(true);
      setError(null);
      setProgress(10);
      try {
        const result = await optimizeProfileImage(file, { kind: "garage_primary" });
        setOptimized(result);
        setPreview(result.previewUrl);
        setProgress(45);
        const ext = extensionFromMime(result.outputMimeType);
        const uploaded = await uploadGarageCarImage({
          file: result.file,
          ownerUid,
          carId,
          fileExtension: ext,
          onProgress: (pct) => setProgress(45 + Math.round(pct * 0.55)),
        });
        const now = new Date().toISOString();
        await updateGarageCarImage(carId, ownerUid, {
          primaryImageUrl: uploaded.downloadUrl,
          primaryImageStoragePath: uploaded.storagePath,
          imageSizeBytes: uploaded.sizeBytes,
          imageContentType: uploaded.contentType,
          imageUpdatedAt: now,
        });
        setPreview(uploaded.downloadUrl);
        onPhotoUrlChange(uploaded.downloadUrl);
        setProgress(100);
      } catch {
        setError(t.garage.uploadFailed);
      } finally {
        setBusy(false);
        setOptimizing(false);
      }
    },
    [carId, onPhotoUrlChange, ownerUid, t.garage.storageRequired, t.garage.uploadFailed]
  );

  const savedPercent =
    optimized && optimized.compressionRatio > 0
      ? Math.round(optimized.compressionRatio * 100)
      : null;

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={disabled || busy ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        className={cn(
          "relative flex aspect-[16/10] w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-white/[0.12] bg-[#080C12]/80 transition",
          "hover:border-[#3B82F6]/35 hover:bg-[#0B1118]/90",
          (disabled || busy) && "pointer-events-none opacity-60"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-[#64748B]">
            <ImagePlus className="size-9" />
            <span className="text-sm text-[#94A3B8]">
              {t.garage.onboardingPhotoHint}
            </span>
          </div>
        )}
        {(busy || optimizing) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55">
            <Loader2 className="size-8 animate-spin text-[#F8FAFC]" />
            {progress > 0 ? (
              <span className="text-xs text-[#CBD5E1]">
                {t.garage.uploadProgress} · {progress}%
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className={cn(garageInputClass, "h-11 w-auto px-4 text-sm font-medium")}
        >
          {preview ? t.garage.changePhoto : t.garage.selectPhoto}
        </button>
      </div>

      {optimized ? (
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-[#151B24]/50 p-3 text-[11px] sm:grid-cols-4">
          <div>
            <dt className="text-[#64748B]">{t.garage.originalSize}</dt>
            <dd className="mt-0.5 font-medium text-[#E2E8F0]">
              {formatBytes(optimized.originalSizeBytes)}
            </dd>
          </div>
          <div>
            <dt className="text-[#64748B]">{t.garage.optimizedSize}</dt>
            <dd className="mt-0.5 font-medium text-[#E2E8F0]">
              {formatBytes(optimized.optimizedSizeBytes)}
            </dd>
          </div>
          {savedPercent != null && savedPercent > 0 ? (
            <div>
              <dt className="text-[#64748B]">{t.garage.compression}</dt>
              <dd className="mt-0.5 font-medium text-emerald-300/90">
                {savedPercent}%
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[#64748B]">{t.garage.targetFormat}</dt>
            <dd className="mt-0.5 font-medium text-[#E2E8F0]">
              {optimized.outputMimeType.replace("image/", "").toUpperCase()}
            </dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="text-xs text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
