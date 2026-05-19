import { doc, getDoc, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { auth, db } from "@/lib/firebase/client";
import type { UserProfile } from "@/lib/types";

export function isProfileAdmin(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.isAdmin === true;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch {
    return null;
  }
}

export async function getOrCreateUserProfile(
  uid: string,
  email: string
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const profile: UserProfile = {
    email,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  if (!db) return profile;

  try {
    await setDoc(doc(db, COLLECTIONS.users, uid), profile, { merge: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[CarRadar] Could not create user profile.", error);
    }
  }

  return profile;
}

export async function refreshCurrentUserProfile(): Promise<UserProfile | null> {
  const user = auth?.currentUser;
  if (!user?.email) return null;
  return getOrCreateUserProfile(user.uid, user.email);
}
