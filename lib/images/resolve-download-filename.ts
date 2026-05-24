import { extensionFromMime } from "@/lib/images/optimize-client-image";

/** Build download filename from suggested base + actual output MIME. */
export function resolveDownloadFileName(
  suggestedFileName: string | undefined,
  outputMimeType: string
): string {
  const ext = extensionFromMime(outputMimeType);
  const fileExt = ext === "jpeg" ? "jpg" : ext;
  if (suggestedFileName) {
    const base = suggestedFileName.replace(/\.[^.]+$/i, "");
    return `${base}.${fileExt}`;
  }
  return `optimized-image.${fileExt}`;
}
