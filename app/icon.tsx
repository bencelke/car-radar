import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Dynamic favicon — replace with final branded asset when ready. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          borderRadius: 8,
          border: "2px solid #ff3b1f",
        }}
      >
        <div
          style={{
            fontSize: 18,
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
