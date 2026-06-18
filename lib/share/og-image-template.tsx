import { ImageResponse } from "next/og";

import { brand } from "@/lib/config/brand";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function shiftitOgImage(input: {
  title: string;
  subtitle?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #05070A 0%, #151B24 45%, #1E1B4B 100%)",
          color: "#F8FAFC",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 28, letterSpacing: 6, color: "#64748B" }}>
            {brand.appName.toUpperCase()}
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            {input.title}
          </div>
          {input.subtitle ? (
            <div style={{ fontSize: 32, color: "#93C5FD" }}>{input.subtitle}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 24, color: "#94A3B8" }}>{input.footer ?? brand.domainName}</div>
          <div
            style={{
              fontSize: 22,
              color: "#FCA5A5",
              border: "1px solid rgba(239,68,68,0.35)",
              padding: "10px 18px",
              borderRadius: 999,
            }}
          >
            {brand.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
