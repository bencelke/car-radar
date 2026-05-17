import type { NavItem } from "@/lib/types/navigation";

export const brand = {
  appName: "CarRadar",
  tagline: "The map of car culture.",
  description:
    "Discover car meets, clubs, tuning shops, detailers, wrap shops, wheel specialists, and enthusiast communities near you.",
  nav: {
    main: [
      { label: "Map", href: "/map" },
      { label: "Events", href: "/events" },
      { label: "Shops", href: "/shops" },
      { label: "Communities", href: "/communities" },
    ] satisfies NavItem[],
    garage: {
      label: "Garage",
      href: "#",
      badge: "Soon" as const,
    },
    submit: { label: "Submit", href: "/submit" },
    admin: { label: "Admin", href: "/admin" },
  },
  location: {
    label: "Showing results for",
    city: "Kaiserslautern",
    country: "Germany",
    radiusKm: 25,
  },
} as const;

export type Brand = typeof brand;
