const ALLOWED_MIME_PREFIX = "image/";
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const TARGET_SIZE = 512;
const TARGET_QUALITY = 0.86;
const MIN_QUALITY = 0.55;

export type OptimizeAvatarResult = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: "image/webp";
  sizeBytes: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("INVALID_IMAGE_FILE"));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("AVATAR_ENCODE_FAILED"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

/** Square center-crop and resize to 512×512 WebP for ShiftIt avatars. */
export async function optimizeAvatarImage(file: File): Promise<OptimizeAvatarResult> {
  const mime = (file.type || "").toLowerCase();
  if (!mime.startsWith(ALLOWED_MIME_PREFIX)) {
    throw new Error("UNSUPPORTED_IMAGE_TYPE");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const img = await loadImageFromFile(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = Math.max(0, (img.naturalWidth - side) / 2);
  const sy = Math.max(0, (img.naturalHeight - side) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("AVATAR_ENCODE_FAILED");

  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  let quality = TARGET_QUALITY;
  let blob = await canvasToWebpBlob(canvas, quality);

  while (blob.size > 300 * 1024 && quality > MIN_QUALITY) {
    quality -= 0.08;
    blob = await canvasToWebpBlob(canvas, quality);
  }

  return {
    blob,
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    mimeType: "image/webp",
    sizeBytes: blob.size,
  };
}
