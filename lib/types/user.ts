export type ShiftItUserRole =
  | "guest"
  | "user"
  | "club_manager"
  | "admin"
  | "founder";

export type ShiftItAdminRole = "founder" | "admin" | "moderator";

export type ShiftItUserTitle =
  | "Founder"
  | "Co-Founder"
  | "Admin"
  | string;

export type ShiftItUserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  publicName?: string | null;
  photoURL?: string | null;
  avatarUrl?: string | null;
  avatarStoragePath?: string | null;
  avatarSource?: "uploaded" | "provider" | "fallback" | null;
  avatarUpdatedAt?: unknown;

  role?: ShiftItUserRole;
  isAdmin?: boolean;

  adminRole?: ShiftItAdminRole;
  title?: ShiftItUserTitle;

  createdAt?: unknown;
  updatedAt?: unknown;
};
