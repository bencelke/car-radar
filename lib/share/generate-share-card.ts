"use client";

import { toPng } from "html-to-image";

import type { ShareCardModel } from "@/lib/share/share-types";
import { shareCardFilename } from "@/lib/share/share-service";
import { downloadBlob } from "@/lib/share/web-share";

export async function downloadShareCard(
  element: HTMLElement,
  model: ShareCardModel
): Promise<Blob> {
  const blob = await renderShareCardBlob(element);
  downloadBlob(blob, shareCardFilename(model, "png"));
  return blob;
}

export async function renderShareCardBlob(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 1,
    width: 1080,
    height: 1350,
  });
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function shareShareCardFile(
  element: HTMLElement,
  model: ShareCardModel,
  payload: { title: string; text: string }
): Promise<"downloaded" | "shared" | "failed"> {
  try {
    const blob = await renderShareCardBlob(element);
    const file = new File([blob], shareCardFilename(model, "png"), {
      type: "image/png",
    });

    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      navigator.canShare?.({ files: [file] })
    ) {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        files: [file],
      });
      return "shared";
    }

    downloadBlob(blob, shareCardFilename(model, "png"));
    return "downloaded";
  } catch {
    return "failed";
  }
}
