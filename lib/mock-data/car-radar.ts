/**
 * Dashboard UI constants and backward-compatible exports.
 * Domain seed data lives in ./seeds.ts — consumed via repositories.
 */

import {
  communityToCommunityItem,
  eventToEventItem,
  shopToShopItem,
  zoneToClubArea,
  buildMapPins,
  shopsToPlaces,
} from "@/lib/mappers/ui";
import {
  mockCommunities,
  mockCommunityZones,
  mockEvents,
  mockShops,
  mockSubmissionsSeed,
} from "@/lib/mock-data/seeds";
import type {
  AdminCity,
  AdminStat,
  DashboardStat,
  FilterOption,
  MonetizationTier,
} from "@/lib/types";

export {
  mockShops,
  mockEvents,
  mockCommunities,
  mockCommunityZones,
  mockClubs,
  mockClubMembers,
} from "@/lib/mock-data/seeds";

export const mockSubmissions = mockSubmissionsSeed;

export const defaultLocation = {
  city: "Kaiserslautern",
  country: "Germany",
  radiusKm: 25,
} as const;

export const filterOptions: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "shops", label: "Shops" },
  { id: "tuning", label: "Tuning / Turbo" },
  { id: "wheels", label: "Wheels / Rims" },
  { id: "detailing", label: "Detailing" },
  { id: "wrap", label: "Wrap / Tint" },
  { id: "clubs", label: "Club Areas" },
];

export const selectedPlaceId = "kmc-performance";

export const dashboardStats: DashboardStat[] = [
  { id: "users", label: "Active users this month", value: "100K+", accent: "blue" },
  { id: "places", label: "New places", value: "2,341", accent: "purple" },
  { id: "events", label: "New events", value: "842", accent: "orange" },
  { id: "interactions", label: "Interactions", value: "18.7K", accent: "green" },
];

export const adminStats: AdminStat[] = [
  { label: "Total Users", value: "100,342", change: "+12.4%", accent: "blue" },
  { label: "Active Users", value: "18,734", change: "+8.2%", accent: "green" },
  { label: "Places", value: "6,842", change: "+4.1%", accent: "purple" },
  { label: "Events", value: "1,238", change: "+6.7%", accent: "orange" },
];

export const adminCities: AdminCity[] = [
  { name: "Kaiserslautern", count: 1842, percent: 92 },
  { name: "Ramstein", count: 1204, percent: 78 },
  { name: "Frankfurt", count: 982, percent: 65 },
  { name: "Stuttgart", count: 756, percent: 52 },
  { name: "Mannheim", count: 621, percent: 44 },
];

export const monetizationTiers: MonetizationTier[] = [
  { title: "Featured shop listings", price: "$99–$199/month" },
  { title: "Verified shop pages", price: "$29–$49/month" },
  { title: "Promoted events", price: "$25–$100/event" },
  { title: "City/category sponsorships", price: "$299–$999/month" },
  { title: "Banner/card placements", price: "$100–$500/month" },
  { title: "Affiliate/partner deals", price: "Performance based" },
];

export const scaleChecklist = [
  "Serverless architecture",
  "Global CDN",
  "Map clustering",
  "Image optimization",
  "Pagination & lazy loading",
  "Secure rules & rate limiting",
  "Backups & monitoring",
] as const;

export const techStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Mapbox (later)",
  "Firebase (later)",
  "Vercel",
] as const;

export const buildFlow = [
  { step: "Next.js", status: "active" },
  { step: "Mapbox", status: "later" },
  { step: "Firebase", status: "later" },
  { step: "Firebase Storage", status: "later" },
  { step: "Vercel", status: "active" },
] as const;

/** @deprecated Prefer repository + mapper; kept for gradual migration */
export const shops = mockShops.map(shopToShopItem);
/** @deprecated Prefer repository + mapper */
export const events = mockEvents.map(eventToEventItem);
/** @deprecated Prefer repository + mapper */
export const communities = mockCommunities.map(communityToCommunityItem);
/** @deprecated Prefer repository + mapper */
export const clubAreas = mockCommunityZones.map(zoneToClubArea);
/** @deprecated Prefer loadDashboardData */
export const places = shopsToPlaces(mockShops);
/** @deprecated Prefer loadDashboardData */
export const mapPins = buildMapPins(mockShops, mockEvents, mockCommunities);
