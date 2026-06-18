"use client";

import { brand } from "@/lib/config/brand";
import type { ShareCardModel } from "@/lib/share/share-types";
import { ShareQrCode } from "@/components/share/ShareQrCode";

type ShareCardRendererProps = {
  model: ShareCardModel;
  includeQr?: boolean;
  /** Render at full export size (1080x1350) off-screen for capture */
  exportMode?: boolean;
};

export function ShareCardRenderer({
  model,
  includeQr = true,
  exportMode = false,
}: ShareCardRendererProps) {
  const scale = exportMode ? 1 : 0.32;

  return (
    <div
      id={exportMode ? "shiftit-share-card-export" : undefined}
      style={{
        width: 1080,
        height: 1350,
        transform: exportMode ? undefined : `scale(${scale})`,
        transformOrigin: "top left",
      }}
      className="relative overflow-hidden bg-[#05070A] text-[#F8FAFC]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/10 via-transparent to-[#3B82F6]/15" />
      <div className="absolute inset-x-0 top-0 h-[720px] bg-[#151B24]">
        {model.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.imageUrl}
            alt=""
            className="size-full object-cover opacity-95"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-[#151B24] via-[#0B1118] to-[#1E1B4B]/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
      </div>

      <div className="relative flex h-full flex-col justify-end p-14">
        <div className="space-y-4">
          <p className="text-[28px] font-medium uppercase tracking-[0.2em] text-[#64748B]">
            {brand.appName}
          </p>
          <h1 className="font-heading text-[72px] font-bold leading-[1.05] text-[#F8FAFC]">
            {model.headline}
          </h1>
          {model.subheadline ? (
            <p className="text-[36px] text-[#93C5FD]">{model.subheadline}</p>
          ) : null}
          <ul className="space-y-2 text-[32px] text-[#CBD5E1]">
            {model.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-end justify-between gap-6 border-t border-white/10 pt-8">
          <div>
            <p className="text-[24px] uppercase tracking-widest text-[#64748B]">
              {brand.domainName}
            </p>
            <p className="mt-2 max-w-[640px] truncate text-[22px] text-[#94A3B8]">
              {model.qrUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
          {includeQr ? (
            <div className="rounded-xl border border-white/10 bg-[#0B1118]/80 p-3">
              <ShareQrCode url={model.qrUrl} size={120} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
