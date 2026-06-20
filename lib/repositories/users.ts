import { doc, getDoc, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { auth, db } from "@/lib/firebase/client";
import {
  firestoreOptionalString,
  sanitizeFirestoreData,
} from "@/lib/firebase/sanitize-firestore";
import type { ProfileImageFields, UserProfile } from "@/lib/types";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/types";

export type UserProfileImageUpdate = ProfileImageFields & {
  avatarUrl: string;
  imageUrl: string;
  imageStoragePath: string;
  imageUpdatedAt: string;
  imageSizeBytes: number;
  imageContentType: string;
};

export type SyncUserProfileInput = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  authProviders?: string[];
};

export type UserProfileSyncResult = {
  profile: UserProfile;
  readError: string | null;
  writeError: string | null;
};

let lastLoggedProfileErrorKey: string | null = null;

function formatFirestoreError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    const message =
      "message" in error && typeof (error as { message: string }).message === "string"
        ? (error as { message: string }).message
        : code;
    return `${code}: ${message}`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

function logUserProfileError(
  phase: "read" | "write",
  uid: string,
  email: string | null,
  error: unknown
): string {
  const formatted = formatFirestoreError(error);
  const key = `${phase}:${uid}:${formatted}`;
  if (lastLoggedProfileErrorKey !== key) {
    lastLoggedProfileErrorKey = key;
    console.warn(
      `[CarRadar] User profile ${phase} failed (uid=${uid}, email=${email ?? "—"}): ${formatted}`
    );
  }
  return formatted;
}

export function isProfileAdmin(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.isAdmin === true;
}

function hasCustomProfileImage(profile: UserProfile): boolean {
  return Boolean(
    profile.avatarUrl?.trim() ||
      profile.imageUrl?.trim() ||
      profile.imageStoragePath?.trim()
  );
}

function mergeAuthProviders(
  existing: string[] | undefined,
  incoming: string[] | undefined
): string[] | undefined {
  if (!incoming?.length) return existing;
  const merged = new Set([...(existing ?? []), ...incoming]);
  return [...merged];
}

function resolveDisplayName(
  existing: UserProfile | null,
  incoming?: string | null
): string | undefined {
  const next = firestoreOptionalString(incoming);
  if (next) return next;
  return existing?.displayName;
}

function resolvePhotoURL(
  existing: UserProfile | null,
  incoming?: string | null
): string | undefined {
  if (existing && hasCustomProfileImage(existing)) {
    return existing.photoURL;
  }
  const next = firestoreOptionalString(incoming);
  if (next) return next;
  return existing?.photoURL;
}

export async function getUserProfile(
  uid: string
): Promise<{ profile: UserProfile | null; error: string | null }> {
  if (!db) return { profile: null, error: null };

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
    if (!snap.exists()) return { profile: null, error: null };
    return {
      profile: { uid, ...snap.data() } as UserProfile,
      error: null,
    };
  } catch (error) {
    return {
      profile: null,
      error: formatFirestoreError(error),
    };
  }
}

function buildCreatePayload(
  input: SyncUserProfileInput,
  now: string
): Record<string, unknown> {
  return sanitizeFirestoreData({
    uid: input.uid,
    email: input.email ?? "",
    displayName: firestoreOptionalString(input.displayName),
    photoURL: firestoreOptionalString(input.photoURL),
    providerPhotoUrl: firestoreOptionalString(input.photoURL),
    authProviders: input.authProviders?.length ? input.authProviders : undefined,
    role: "user",
    isAdmin: false,
    notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    unreadNotificationCount: 0,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });
}

function buildSafeUpdatePayload(
  input: SyncUserProfileInput,
  existing: UserProfile,
  now: string
): Record<string, unknown> {
  const providers = mergeAuthProviders(existing.authProviders, input.authProviders);
  const payload: Record<string, unknown> = {
    updatedAt: now,
    lastLoginAt: now,
  };

  if (input.email) {
    payload.email = input.email;
  }

  const displayName = resolveDisplayName(existing, input.displayName);
  if (displayName) {
    payload.displayName = displayName;
  }

  const providerPhoto = firestoreOptionalString(input.photoURL);
  if (providerPhoto) {
    payload.providerPhotoUrl = providerPhoto;
  }

  const photoURL = resolvePhotoURL(existing, input.photoURL);
  if (photoURL) {
    payload.photoURL = photoURL;
  }

  if (providers?.length) {
    payload.authProviders = providers;
  }

  return sanitizeFirestoreData(payload);
}

/**
 * Ensures users/{uid} exists on sign-in/sign-up.
 * Never overwrites role or isAdmin on existing profiles.
 */
export async function syncUserProfile(
  input: SyncUserProfileInput
): Promise<UserProfileSyncResult> {
  const now = new Date().toISOString();
  let readError: string | null = null;
  let writeError: string | null = null;

  const { profile: existing, error: fetchError } = await getUserProfile(
    input.uid
  );
  if (fetchError) {
    readError = logUserProfileError("read", input.uid, input.email, {
      code: fetchError.split(":")[0],
      message: fetchError,
    });
  }

  if (!existing) {
    if (db) {
      try {
        await setDoc(
          doc(db, COLLECTIONS.users, input.uid),
          buildCreatePayload(input, now)
        );
      } catch (error) {
        writeError = logUserProfileError("write", input.uid, input.email, error);
      }
    }

    const refetched = await getUserProfile(input.uid);
    if (refetched.profile) {
      return {
        profile: refetched.profile,
        readError: refetched.error ?? readError,
        writeError,
      };
    }

    const profile: UserProfile = {
      uid: input.uid,
      email: input.email ?? "",
      displayName: firestoreOptionalString(input.displayName) ?? undefined,
      photoURL: firestoreOptionalString(input.photoURL) ?? undefined,
      authProviders: input.authProviders?.length ? input.authProviders : undefined,
      role: "user",
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    return { profile, readError, writeError };
  }

  const patch = buildSafeUpdatePayload(input, existing, now);
  const merged: UserProfile = {
    ...existing,
    uid: input.uid,
    email: input.email ?? existing.email,
    displayName: resolveDisplayName(existing, input.displayName),
    photoURL: resolvePhotoURL(existing, input.photoURL),
    authProviders: mergeAuthProviders(existing.authProviders, input.authProviders),
    updatedAt: now,
    lastLoginAt: now,
  };

  if (db && Object.keys(patch).length > 0) {
    try {
      await setDoc(doc(db, COLLECTIONS.users, input.uid), patch, { merge: true });
    } catch (error) {
      writeError = logUserProfileError("write", input.uid, input.email, error);
    }
  }

  return { profile: merged, readError, writeError };
}

/** @deprecated Prefer syncUserProfile */
export async function getOrCreateUserProfile(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<UserProfile> {
  const result = await syncUserProfile({ uid, email, displayName, photoURL });
  return result.profile;
}

export async function refreshCurrentUserProfile(): Promise<UserProfileSyncResult | null> {
  const user = auth?.currentUser;
  if (!user) return null;

  const { extractAuthProviders, resolveProviderEmail } = await import(
    "@/lib/auth/social-auth"
  );

  return syncUserProfile({
    uid: user.uid,
    email: resolveProviderEmail(user),
    displayName: user.displayName,
    photoURL: user.photoURL,
    authProviders: extractAuthProviders(user),
  });
}

export async function updateUserProfileImage(
  uid: string,
  image: UserProfileImageUpdate
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = image.imageUpdatedAt || new Date().toISOString();
  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    sanitizeFirestoreData({
      avatarUrl: image.avatarUrl,
      imageUrl: image.imageUrl,
      imageStoragePath: image.imageStoragePath,
      imageUpdatedAt: now,
      imageSizeBytes: image.imageSizeBytes,
      imageContentType: image.imageContentType,
      updatedAt: now,
    }),
    { merge: true }
  );
}

export async function updateUserInstagramProfile(
  uid: string,
  handle: string,
  url: string
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = new Date().toISOString();
  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    sanitizeFirestoreData({
      instagramHandle: handle,
      instagramUrl: url,
      instagramVerificationStatus: "unverified",
      updatedAt: now,
    }),
    { merge: true }
  );
}
