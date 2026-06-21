import { ROUTES } from "@/lib/config/routes";

/** Whether a public nav item should appear active for the current pathname. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }

  if (href === ROUTES.map) {
    return pathname === ROUTES.map;
  }

  if (href === ROUTES.clubs) {
    return (
      pathname === ROUTES.clubs ||
      pathname.startsWith(`${ROUTES.clubs}/`) ||
      pathname === ROUTES.communities ||
      pathname.startsWith(`${ROUTES.communities}/`)
    );
  }

  if (href === ROUTES.events) {
    return (
      pathname === ROUTES.events || pathname.startsWith(`${ROUTES.events}/`)
    );
  }

  if (href === ROUTES.shops) {
    return pathname === ROUTES.shops || pathname.startsWith(`${ROUTES.shops}/`);
  }

  if (href === ROUTES.members) {
    return pathname === ROUTES.members || pathname.startsWith(`${ROUTES.members}/`);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
