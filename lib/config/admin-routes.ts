/** Admin Control Center route paths */
export const ADMIN_ROUTES = {
  overview: "/admin",
  invitations: "/admin/invitations",
  claims: "/admin/claims",
  submissions: "/admin/submissions",
  clubs: "/admin/clubs",
  members: "/admin/members",
  users: "/admin/users",
  events: "/admin/events",
  shops: "/admin/shops",
  advertising: "/admin/advertising",
  reports: "/admin/reports",
  content: "/admin/content",
  settings: "/admin/settings",
  diagnostics: "/admin/diagnostics",
} as const;

export type AdminRoutePath = (typeof ADMIN_ROUTES)[keyof typeof ADMIN_ROUTES];
