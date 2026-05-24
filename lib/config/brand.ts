import type { NavItem } from "@/lib/types/navigation";

export const brand = {
  appName: "ShiftIt",
  domainName: "ShiftIt.club",
  legacyName: "CarRadar",
  tagline: "Map the car scene.",
  description:
    "Discover car clubs, member cars, meets, shops, and local automotive culture around you.",
  logoDarkPath: "/brand/shiftit-dark.png",
  logoWebpPath: "/brand/shiftit-logo.webp",
  navLogoPath: "/brand/shiftit-logo-small.webp",
  logoHeroPath: "/brand/shiftit-logo.webp",
  logoSourcePath: "Logo/shiftit-dark.png",
  /** Nav mark sizing (CSS px) — see ShiftItLogo variant="nav" */
  navLogo: {
    mobile: { height: 30, maxWidth: 124 },
    desktop: { height: 40, maxWidth: 180 },
  },
  metadata: {
    title: "ShiftIt | Car Scene Map",
    siteName: "ShiftIt",
    twitterHandle: "@shiftitclub",
  },
  nav: {
    main: [
      { label: "Map", href: "/map" },
      { label: "Events", href: "/events" },
      { label: "Shops", href: "/shops" },
      { label: "Clubs", href: "/clubs" },
    ] satisfies NavItem[],
    garage: {
      label: "Garage",
      href: "#",
      badge: "Soon" as const,
    },
    submit: { label: "Submit", href: "/submit" },
    admin: { label: "Admin", href: "/admin" },
    login: { label: "Login", href: "/login" },
    profile: { label: "Profile", href: "/profile" },
  },
  location: {
    label: "Showing results for",
    city: "Kaiserslautern",
    country: "Germany",
    radiusKm: 25,
  },
} as const;

export type Brand = typeof brand;
