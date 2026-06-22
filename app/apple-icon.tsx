import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — replace with final branded asset when ready. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #050505 0%, #111827 100%)",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            border: "4px solid #ff3b1f",
            background: "rgba(255,59,31,0.12)",
            fontSize: 64,
            fontWeight: 700,
            color: "#ff3b1f",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          S
        </div>
      </div>
    ),
    { ...size }
  );
}
