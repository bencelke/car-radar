import { doc, setDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { auth, db, storage } from "@/lib/firebase/client";
import { uploadBlobToPath } from "@/lib/firebase/storage";
import { optimizeAvatarImage } from "@/lib/images/optimize-avatar";
import {
  firestoreOptionalString,
  sanitizeFirestoreData,
} from "@/lib/firebase/sanitize-firestore";

export const USER_AVATAR_FILE_NAME = "avatar_512.webp";

export function userAvatarStoragePath(uid: string): string {
  return `users/${uid}/avatar/${USER_AVATAR_FILE_NAME}`;
}

export async function uploadUserAvatar(params: {
  uid: string;
  file: File;
  onProgress?: (percent: number) => void;
}): Promise<{
  avatarUrl: string;
  avatarStoragePath: string;
  sizeBytes: number;
}> {
  if (!db || !storage) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const optimized = await optimizeAvatarImage(params.file);
  const avatarStoragePath = userAvatarStoragePath(params.uid);
  const avatarFile = new File([optimized.blob], USER_AVATAR_FILE_NAME, {
    type: optimized.mimeType,
    lastModified: Date.now(),
  });

  const uploaded = await uploadBlobToPath(
    avatarStoragePath,
    avatarFile,
    "webp",
    params.onProgress
  );

  const now = new Date().toISOString();
  await setDoc(
    doc(db, COLLECTIONS.users, params.uid),
    sanitizeFirestoreData({
      avatarUrl: uploaded.downloadUrl,
      avatarStoragePath,
      avatarSource: "uploaded",
      avatarUpdatedAt: now,
      avatarSizeBytes: optimized.sizeBytes,
      avatarContentType: optimized.mimeType,
      imageUrl: uploaded.downloadUrl,
      imageStoragePath: avatarStoragePath,
      imageUpdatedAt: now,
      imageSizeBytes: optimized.sizeBytes,
      imageContentType: optimized.mimeType,
      updatedAt: now,
    }),
    { merge: true }
  );

  try {
    if (auth?.currentUser && auth.currentUser.uid === params.uid) {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(auth.currentUser, { photoURL: uploaded.downloadUrl });
    }
  } catch {
    /* Firestore avatar remains source of truth */
  }

  return {
    avatarUrl: uploaded.downloadUrl,
    avatarStoragePath,
    sizeBytes: optimized.sizeBytes,
  };
}

async function deleteStorageObjectIfExists(storagePath: string): Promise<void> {
  if (!storage) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (code === "storage/object-not-found") return;
    throw error;
  }
}

export async function removeUserAvatar(uid: string): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const { getUserProfile } = await import("@/lib/repositories/users");
  const { profile } = await getUserProfile(uid);
  const paths = new Set<string>();

  const avatarPath = firestoreOptionalString(profile?.avatarStoragePath);
  const legacyPath = firestoreOptionalString(profile?.imageStoragePath);
  if (avatarPath) paths.add(avatarPath);
  if (legacyPath?.includes("/avatar/") || legacyPath?.startsWith("profile-images/user/")) {
    paths.add(legacyPath);
  }
  paths.add(userAvatarStoragePath(uid));

  for (const path of paths) {
    await deleteStorageObjectIfExists(path);
  }

  const now = new Date().toISOString();
  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    sanitizeFirestoreData({
      avatarUrl: null,
      avatarStoragePath: null,
      avatarSource: null,
      avatarUpdatedAt: null,
      avatarSizeBytes: null,
      avatarContentType: null,
      imageUrl: null,
      imageStoragePath: null,
      imageUpdatedAt: null,
      imageSizeBytes: null,
      imageContentType: null,
      updatedAt: now,
    }),
    { merge: true }
  );
}
