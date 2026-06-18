export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function canShareFiles(): boolean {
  return (
    canUseNativeShare() &&
    typeof navigator.canShare === "function" &&
    typeof File !== "undefined"
  );
}

export async function copyShareLink(url: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    /* fallback below */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function shareViaWebShare(input: {
  title: string;
  text: string;
  url: string;
  files?: File[];
}): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!canUseNativeShare()) return "unsupported";

  try {
    const payload: ShareData = {
      title: input.title,
      text: input.text,
      url: input.url,
    };
    if (input.files?.length && canShareFiles() && navigator.canShare?.({ files: input.files })) {
      await navigator.share({ ...payload, files: input.files });
    } else {
      await navigator.share(payload);
    }
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    throw error;
  }
}

export async function shareShareCardFile(file: File, payload: { title: string; text: string }): Promise<boolean> {
  const result = await shareViaWebShare({
    title: payload.title,
    text: payload.text,
    url: "",
    files: [file],
  });
  return result === "shared";
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
