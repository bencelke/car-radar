import { doc, getDoc, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { auth, db } from "@/lib/firebase/client";
import {
  firestoreOptionalString,
  sanitizeFirestoreData,
} from "@/lib/firebase/sanitize-firestore";
import type { ProfileImageFields, UserProfile } from "@/lib/types";

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
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
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
  email: string,
  error: unknown
): string {
  const formatted = formatFirestoreError(error);
  const key = `${phase}:${uid}:${formatted}`;
  if (lastLoggedProfileErrorKey !== key) {
    lastLoggedProfileErrorKey = key;
    console.warn(
      `[CarRadar] User profile ${phase} failed (uid=${uid}, email=${email}): ${formatted}`
    );
  }
  return formatted;
}

export function isProfileAdmin(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.isAdmin === true;
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
    email: input.email,
    displayName: firestoreOptionalString(input.displayName),
    photoURL: firestoreOptionalString(input.photoURL),
    role: "user",
    isAdmin: false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });
}

/** Merge-safe when document may already exist (never sets role/isAdmin). */
function buildInitMergePayload(
  input: SyncUserProfileInput,
  now: string
): Record<string, unknown> {
  return sanitizeFirestoreData({
    uid: input.uid,
    email: input.email,
    displayName: firestoreOptionalString(input.displayName),
    photoURL: firestoreOptionalString(input.photoURL),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });
}

function buildSafeUpdatePayload(
  input: SyncUserProfileInput,
  now: string
): Record<string, unknown> {
  return sanitizeFirestoreData({
    email: input.email,
    displayName: firestoreOptionalString(input.displayName),
    photoURL: firestoreOptionalString(input.photoURL),
    updatedAt: now,
    lastLoginAt: now,
  });
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
        if (fetchError) {
          await setDoc(
            doc(db, COLLECTIONS.users, input.uid),
            buildInitMergePayload(input, now),
            { merge: true }
          );
        } else {
          await setDoc(
            doc(db, COLLECTIONS.users, input.uid),
            buildCreatePayload(input, now)
          );
        }
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
      email: input.email,
      displayName: firestoreOptionalString(input.displayName) ?? undefined,
      photoURL: firestoreOptionalString(input.photoURL) ?? undefined,
      role: "user",
      isAdmin: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    return { profile, readError, writeError };
  }

  const patch = buildSafeUpdatePayload(input, now);
  const merged: UserProfile = {
    ...existing,
    uid: input.uid,
    email: input.email,
    displayName: firestoreOptionalString(input.displayName) ?? undefined,
    photoURL: firestoreOptionalString(input.photoURL) ?? undefined,
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
  if (!user?.email) return null;
  return syncUserProfile({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
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
