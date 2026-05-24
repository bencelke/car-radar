"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { isProfileAdmin, syncUserProfile } from "@/lib/repositories/users";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  isDevAdminBypass: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function profileFromAuthUser(user: User) {
  return syncUserProfile({
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName,
    photoURL: user.photoURL,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [adminLoading, setAdminLoading] = useState(false);

  const isDevAdminBypass =
    process.env.NODE_ENV === "development" && !isFirebaseConfigured;

  const applySyncResult = useCallback(
    (result: Awaited<ReturnType<typeof syncUserProfile>>) => {
      setProfile(result.profile);
      const errors = [result.readError, result.writeError].filter(Boolean);
      setProfileError(errors.length > 0 ? errors.join(" · ") : null);
    },
    []
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setAdminLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        setProfile(null);
        setProfileError(null);
        setAdminLoading(false);
        return;
      }

      setAdminLoading(true);
      void profileFromAuthUser(nextUser)
        .then(applySyncResult)
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : String(error);
          setProfileError(message);
          console.warn(
            `[CarRadar] User profile sync failed (uid=${nextUser.uid}): ${message}`
          );
        })
        .finally(() => setAdminLoading(false));
    });

    return () => unsubscribe();
  }, [applySyncResult]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const result = await syncUserProfile({
      uid: credential.user.uid,
      email: credential.user.email ?? email.trim(),
      displayName: credential.user.displayName,
      photoURL: credential.user.photoURL,
    });
    applySyncResult(result);
  }, [applySyncResult]);

  const signOut = useCallback(async () => {
    if (!auth) {
      setUser(null);
      setProfile(null);
      setProfileError(null);
      return;
    }
    await firebaseSignOut(auth);
    setProfile(null);
    setProfileError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setAdminLoading(true);
    try {
      const result = await profileFromAuthUser(user);
      applySyncResult(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileError(message);
    } finally {
      setAdminLoading(false);
    }
  }, [user, applySyncResult]);

  const isAdmin =
    isDevAdminBypass || (Boolean(user) && isProfileAdmin(profile));

  const value = useMemo(
    () => ({
      user,
      profile,
      profileError,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [
      user,
      profile,
      profileError,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
