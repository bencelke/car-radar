import type { PublicNavKey } from "@/lib/config/routes";
import { PUBLIC_NAV_ITEMS, ROUTES } from "@/lib/config/routes";

export type MobileBottomNavKey = PublicNavKey;

export type MobileBottomNavItem = {
  key: MobileBottomNavKey;
  href: string;
  labelKey: `nav.${MobileBottomNavKey}`;
};

/** Primary mobile tab bar — mirrors core discovery routes. */
export const MOBILE_BOTTOM_NAV_ITEMS: MobileBottomNavItem[] = PUBLIC_NAV_ITEMS;

export function shouldShowMobileBottomNav(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === ROUTES.login) return false;
  if (pathname.startsWith("/admin")) return false;
  return true;
}
