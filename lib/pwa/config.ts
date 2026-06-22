/** PWA install / mobile shell constants (shared by layout + CSS). */
export const PWA_CONFIG = {
  name: "ShiftIt",
  shortName: "ShiftIt",
  description:
    "Discover car clubs, meets, shops, and automotive communities near you.",
  startUrl: "/",
  display: "standalone" as const,
  backgroundColor: "#050505",
  themeColor: "#ff3b1f",
  manifestPath: "/manifest.webmanifest",
} as const;
