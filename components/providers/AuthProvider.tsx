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
import {
  getOrCreateUserProfile,
  isProfileAdmin,
} from "@/lib/repositories/users";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  isDevAdminBypass: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [adminLoading, setAdminLoading] = useState(false);

  const isDevAdminBypass = !isFirebaseConfigured;

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
        setAdminLoading(false);
        return;
      }

      setAdminLoading(true);
      void getOrCreateUserProfile(nextUser.uid, nextUser.email ?? "")
        .then(setProfile)
        .finally(() => setAdminLoading(false));
    });

    return () => unsubscribe();
  }, []);

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
    await getOrCreateUserProfile(
      credential.user.uid,
      credential.user.email ?? email.trim()
    );
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) {
      setUser(null);
      setProfile(null);
      return;
    }
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const isAdmin =
    isDevAdminBypass || (Boolean(user) && isProfileAdmin(profile));

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      signIn,
      signUp,
      signOut,
    }),
    [
      user,
      profile,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      signIn,
      signUp,
      signOut,
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
