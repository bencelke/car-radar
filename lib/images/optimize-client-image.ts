import imageCompression from "browser-image-compression";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_RAW_BYTES = 8 * 1024 * 1024;

export type ProfileImageKind =
  | "avatar"
  | "member_car"
  | "club_cover"
  | "club_logo";

export type OptimizeProfileImageOptions = {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  initialQuality?: number;
  kind?: ProfileImageKind;
};

export function getOptimizeOptionsForKind(
  kind: ProfileImageKind
): OptimizeProfileImageOptions {
  if (kind === "member_car") {
    return {
      kind: "member_car",
      maxWidthOrHeight: 1200,
      maxSizeMB: 0.22,
      initialQuality: 0.78,
    };
  }
  if (kind === "club_cover") {
    return {
      kind: "club_cover",
      maxWidthOrHeight: 1600,
      maxSizeMB: 0.45,
      initialQuality: 0.78,
    };
  }
  if (kind === "club_logo") {
    return {
      kind: "club_logo",
      maxWidthOrHeight: 512,
      maxSizeMB: 0.12,
      initialQuality: 0.82,
    };
  }
  return {
    kind: "avatar",
    maxWidthOrHeight: 900,
    maxSizeMB: 0.18,
    initialQuality: 0.78,
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

  const kind = options?.kind ?? "avatar";
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
