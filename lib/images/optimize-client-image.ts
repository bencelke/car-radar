import imageCompression from "browser-image-compression";

import {
  getImagePreset,
  type ImagePresetId,
} from "@/lib/images/image-presets";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_RAW_BYTES = 8 * 1024 * 1024;

export type ProfileImageKind = ImagePresetId | "avatar";

export type OptimizeProfileImageOptions = {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  initialQuality?: number;
  kind?: ProfileImageKind;
};

export function getOptimizeOptionsForKind(
  kind: ProfileImageKind
): OptimizeProfileImageOptions {
  const presetId =
    kind === "avatar" ? "profile_avatar" : kind;
  const preset = getImagePreset(presetId);
  return {
    kind,
    maxWidthOrHeight: preset.maxDimension,
    maxSizeMB: preset.maxSizeMB,
    initialQuality: preset.initialQuality,
  };
}

export type OptimizeProfileImageResult = {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  compressionRatio: number;
  outputMimeType: string;
  width?: number;
  height?: number;
};

function mimeToExtension(mime: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  return "jpg";
}

function buildOutputFile(blob: Blob, baseName: string, mime: string): File {
  const ext = mimeToExtension(mime);
  const safeBase = baseName.replace(/\.[^.]+$/, "") || "profile";
  return new File([blob], `${safeBase}.${ext}`, { type: mime, lastModified: Date.now() });
}

async function compressWithMime(
  file: File,
  options: OptimizeProfileImageOptions,
  fileType?: string
): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB ?? 0.18,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 900,
    useWebWorker: true,
    initialQuality: options.initialQuality ?? 0.78,
    ...(fileType ? { fileType } : {}),
  });
  if (compressed instanceof File) return compressed;
  const blob = compressed as Blob;
  const mime = fileType ?? blob.type ?? "image/jpeg";
  return buildOutputFile(blob, file.name, mime);
}

async function readImageDimensions(
  file: File
): Promise<{ width?: number; height?: number }> {
  if (typeof window === "undefined") return {};
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

export async function optimizeProfileImage(
  file: File,
  options?: OptimizeProfileImageOptions
): Promise<OptimizeProfileImageResult> {
  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("UNSUPPORTED_IMAGE_TYPE");
  }
  if (file.size > MAX_RAW_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const kind = options?.kind ?? "profile_avatar";
  const preset = getOptimizeOptionsForKind(kind);
  const opts: OptimizeProfileImageOptions = {
    ...preset,
    ...options,
    kind,
  };
  let output: File;

  try {
    output = await compressWithMime(file, opts, "image/webp");
    if (!output.type || output.type === "application/octet-stream") {
      output = buildOutputFile(output, file.name, "image/webp");
    }
  } catch {
    output = await compressWithMime(file, opts, "image/jpeg");
    if (!output.type || output.type === "application/octet-stream") {
      output = buildOutputFile(output, file.name, "image/jpeg");
    }
  }

  const dimensions = await readImageDimensions(output);
  const previewUrl = URL.createObjectURL(output);
  const originalSizeBytes = file.size;
  const optimizedSizeBytes = output.size;
  const compressionRatio =
    originalSizeBytes > 0
      ? 1 - optimizedSizeBytes / originalSizeBytes
      : 0;

  return {
    file: output,
    previewUrl,
    originalSizeBytes,
    optimizedSizeBytes,
    compressionRatio,
    outputMimeType: output.type || "image/jpeg",
    width: dimensions.width,
    height: dimensions.height,
  };
}

export function extensionFromMime(mime: string): "webp" | "jpg" | "jpeg" | "png" {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpeg";
  return "jpg";
}
