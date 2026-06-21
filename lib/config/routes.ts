/** Main discovery home after sign-in when no valid `next` query is present. */
export const DEFAULT_AFTER_LOGIN_ROUTE = "/" as const;

export const ROUTES = {
  home: "/",
  map: "/map",
  events: "/events",
  shops: "/shops",
  clubs: "/clubs",
  members: "/members",
  communities: "/communities",
  garage: "/garage",
  submit: "/submit",
  profile: "/profile",
  login: "/login",
  admin: "/admin",
  feed: "/feed",
  following: "/following",
  notifications: "/notifications",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export type PublicNavKey = "home" | "map" | "events" | "shops" | "clubs";

export type PublicNavItem = {
  key: PublicNavKey;
  href: string;
  labelKey: `nav.${PublicNavKey}`;
};

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { key: "home", href: ROUTES.home, labelKey: "nav.home" },
  { key: "map", href: ROUTES.map, labelKey: "nav.map" },
  { key: "events", href: ROUTES.events, labelKey: "nav.events" },
  { key: "shops", href: ROUTES.shops, labelKey: "nav.shops" },
  { key: "clubs", href: ROUTES.clubs, labelKey: "nav.clubs" },
];

export function submitRoute(type?: "event" | "club" | "shop" | "member"): string {
  if (!type) return ROUTES.submit;
  return `${ROUTES.submit}?type=${type}`;
}
