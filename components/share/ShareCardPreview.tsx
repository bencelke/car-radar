"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { ShareCardRenderer } from "@/components/share/ShareCardRenderer";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  downloadShareCard,
  shareShareCardFile,
} from "@/lib/share/generate-share-card";
import { trackShare } from "@/lib/share/share-service";
import type { ShareCardModel, SharePayload } from "@/lib/share/share-types";

type ShareCardPreviewProps = {
  model: ShareCardModel;
  payload: SharePayload;
  userId?: string;
};

export function ShareCardPreview({ model, payload, userId }: ShareCardPreviewProps) {
  const { t } = useLocale();
  const [includeQr, setIncludeQr] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  async function captureCard(): Promise<HTMLElement | null> {
    return exportRef.current;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[#F8FAFC]">{t.share.shareCardPreview}</p>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#05070A]">
        <div className="h-[432px] overflow-hidden">
          <ShareCardRenderer model={model} includeQr={includeQr} exportMode={false} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
        <input
          type="checkbox"
          checked={includeQr}
          onChange={(e) => setIncludeQr(e.target.checked)}
        />
        {t.share.includeQrCode}
      </label>

      <div className="fixed left-[-9999px] top-0" aria-hidden>
        <div ref={exportRef}>
          <ShareCardRenderer model={model} includeQr={includeQr} exportMode />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="border border-[#EF4444]/30 bg-[#EF4444]/10"
          onClick={() => {
            setBusy(true);
            void (async () => {
              const el = await captureCard();
              if (!el) return;
              await downloadShareCard(el, model);
              void trackShare({
                action: "card_downloaded",
                entityType: model.entityType,
                entityId: model.entityId,
                userId,
                source: "share_card",
              });
              setMessage(t.share.downloadShareCard);
              setBusy(false);
            })();
          }}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : t.share.downloadShareCard}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          className="border-white/10"
          onClick={() => {
            setBusy(true);
            void (async () => {
              const el = await captureCard();
              if (!el) return;
              const result = await shareShareCardFile(el, model, payload);
              if (result !== "failed") {
                void trackShare({
                  action: result === "shared" ? "native_share" : "card_downloaded",
                  entityType: model.entityType,
                  entityId: model.entityId,
                  userId,
                  source: "share_card",
                });
              }
              setMessage(result === "shared" ? t.share.shareImage : t.share.downloadShareCard);
              setBusy(false);
            })();
          }}
        >
          {t.share.shareImage}
        </Button>
      </div>
      {message ? <p className="text-[10px] text-[#64748B]">{message}</p> : null}
    </div>
  );
}
