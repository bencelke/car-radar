"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, RefreshCw } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { CHECK_IN_TOKEN_TTL_MS } from "@/lib/events/check-in-token";

type EventCheckInQrPanelProps = {
  checkInUrl: string;
  expiresAt: string;
  onRotate: () => void;
  rotating?: boolean;
};

export function EventCheckInQrPanel({
  checkInUrl,
  expiresAt,
  onRotate,
  rotating = false,
}: EventCheckInQrPanelProps) {
  const { t } = useLocale();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(checkInUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#0B1118", light: "#F8FAFC" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [checkInUrl]);

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  async function copyLink() {
    await navigator.clipboard.writeText(checkInUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-white/[0.1] bg-[#0B1118]/80 p-4">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
        {t.checkIn.scanToCheckIn}
      </p>
      <div className="rounded-xl border border-white/[0.12] bg-white p-3 shadow-[0_0_40px_-12px_rgba(59,130,246,0.45)]">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt={t.checkIn.scanToCheckIn}
            width={280}
            height={280}
            className="size-[min(280px,72vw)] h-auto w-auto"
          />
        ) : (
          <div className="size-[min(280px,72vw)] animate-pulse bg-[#E2E8F0]" />
        )}
        <canvas ref={canvasRef} className="hidden" aria-hidden />
      </div>
      <p className="text-center text-[11px] text-[#64748B]">
        {t.checkIn.codeExpiresIn}{" "}
        <span className="font-mono text-[#CBD5E1]">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </p>
      <p className="max-w-full break-all text-center text-[10px] text-[#64748B]">
        {checkInUrl}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/[0.12] text-[#CBD5E1]"
          onClick={() => void copyLink()}
        >
          <Copy className="size-3.5" />
          {copied ? "Copied" : t.checkIn.copyCheckInLink}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={rotating}
          className="border-white/[0.12] text-[#CBD5E1]"
          onClick={onRotate}
        >
          <RefreshCw className={`size-3.5 ${rotating ? "animate-spin" : ""}`} />
          {t.checkIn.rotateQrCode}
        </Button>
      </div>
      <p className="text-[10px] text-[#64748B]">
        Session TTL: {Math.round(CHECK_IN_TOKEN_TTL_MS / 60000)} min
      </p>
    </div>
  );
}
