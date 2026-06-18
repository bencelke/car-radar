"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import {
  extensionFromMime,
  optimizeProfileImage,
} from "@/lib/images/optimize-client-image";
import {
  isFirebaseStorageConfigured,
  uploadGarageCarImage,
} from "@/lib/firebase/storage";
import { updateGarageCarImage } from "@/lib/repositories/garage-cars";
import { cn } from "@/lib/utils";

type GarageCarImageUploaderProps = {
  ownerUid: string;
  carId: string;
  currentImageUrl?: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export function GarageCarImageUploader({
  ownerUid,
  carId,
  currentImageUrl,
  onUploaded,
  disabled,
}: GarageCarImageUploaderProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImageUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!isFirebaseStorageConfigured()) {
        setError(t.garage.storageRequired);
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const optimized = await optimizeProfileImage(file, { kind: "garage_primary" });
        setPreview(optimized.previewUrl);
        const ext = extensionFromMime(optimized.outputMimeType);
        const uploaded = await uploadGarageCarImage({
          file: optimized.file,
          ownerUid,
          carId,
          fileExtension: ext,
        });
        const now = new Date().toISOString();
        await updateGarageCarImage(carId, ownerUid, {
          primaryImageUrl: uploaded.downloadUrl,
          primaryImageStoragePath: uploaded.storagePath,
          imageSizeBytes: uploaded.sizeBytes,
          imageContentType: uploaded.contentType,
          imageUpdatedAt: now,
        });
        onUploaded(uploaded.downloadUrl);
      } catch {
        setError(t.garage.uploadFailed);
      } finally {
        setBusy(false);
      }
    },
    [carId, onUploaded, ownerUid, t.garage.storageRequired, t.garage.uploadFailed]
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/[0.12] bg-[#0B1118]/80",
          !preview && "min-h-[180px]"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#64748B]">
            <ImagePlus className="size-8" />
            <span className="text-xs">{t.garage.uploadPrimaryPhoto}</span>
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-8 animate-spin text-[#F8FAFC]" />
          </div>
        ) : null}
      </button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
