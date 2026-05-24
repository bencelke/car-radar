/**
 * Triggers a browser download for an optimized image file (client-only).
 */
export function downloadOptimizedImage(
  blobOrFile: Blob | File,
  fileName: string
): void {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blobOrFile);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
