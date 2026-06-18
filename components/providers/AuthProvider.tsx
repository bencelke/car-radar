"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import {
  extractAuthProviders,
  processSocialRedirectResult,
  resolveProviderEmail,
  signInWithApple as signInWithAppleSocial,
  signInWithGoogle as signInWithGoogleSocial,
  type SocialAuthProviderId,
} from "@/lib/auth/social-auth";
import { consumeAuthNext } from "@/lib/auth/social-auth";
import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { isProfileAdmin, syncUserProfile } from "@/lib/repositories/users";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  profileError: string | null;
  authError: string | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  isDevAdminBypass: boolean;
  socialAuthLoadingProvider: SocialAuthProviderId | null;
  postAuthRedirect: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (nextUrl?: string) => Promise<string | null>;
  signInWithApple: (nextUrl?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearPostAuthRedirect: () => void;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function profileFromAuthUser(user: User) {
  return syncUserProfile({
    uid: user.uid,
    email: resolveProviderEmail(user),
    displayName: user.displayName,
    photoURL: user.photoURL,
    authProviders: extractAuthProviders(user),
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [adminLoading, setAdminLoading] = useState(false);
  const [socialAuthLoadingProvider, setSocialAuthLoadingProvider] =
    useState<SocialAuthProviderId | null>(null);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);
  const profileSyncRef = useRef<{
    uid: string;
    promise: Promise<void>;
  } | null>(null);
  const redirectHandledRef = useRef(false);

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

  const syncProfileForUser = useCallback(
    async (nextUser: User, force = false) => {
      if (
        !force &&
        profileSyncRef.current?.uid === nextUser.uid &&
        profileSyncRef.current.promise
      ) {
        return profileSyncRef.current.promise;
      }

      const promise = (async () => {
        setAdminLoading(true);
        try {
          const result = await profileFromAuthUser(nextUser);
          applySyncResult(result);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          setProfileError(message);
          console.warn(
            `[CarRadar] User profile sync failed (uid=${nextUser.uid}): ${message}`
          );
        } finally {
          setAdminLoading(false);
        }
      })();

      profileSyncRef.current = { uid: nextUser.uid, promise };
      await promise;
    },
    [applySyncResult]
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;

    if (!redirectHandledRef.current) {
      redirectHandledRef.current = true;
      void (async () => {
        try {
          const redirectResult = await processSocialRedirectResult();
          if (cancelled) return;
          if (redirectResult?.user) {
            setPostAuthRedirect(consumeAuthNext());
          }
        } catch (error) {
          if (!cancelled) {
            setAuthError(
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      })();
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        profileSyncRef.current = null;
        setProfile(null);
        setProfileError(null);
        setAdminLoading(false);
        return;
      }

      void syncProfileForUser(nextUser);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncProfileForUser]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    setAuthError(null);
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const runSocialSignIn = useCallback(
    async (
      provider: SocialAuthProviderId,
      nextUrl: string | undefined,
      signInFn: (
        next?: string,
        forceRedirect?: boolean
      ) => Promise<Awaited<ReturnType<typeof signInWithGoogleSocial>>>
    ): Promise<string | null> => {
      if (!auth) {
        throw new Error("Firebase Auth is not configured.");
      }
      setAuthError(null);
      setSocialAuthLoadingProvider(provider);
      try {
        const result = await signInFn(nextUrl);
        if (!result) return null;
        return sanitizeNextPath(nextUrl);
      } finally {
        setSocialAuthLoadingProvider(null);
      }
    },
    []
  );

  const signInWithGoogle = useCallback(
    (nextUrl?: string) =>
      runSocialSignIn("google", nextUrl, signInWithGoogleSocial),
    [runSocialSignIn]
  );

  const signInWithApple = useCallback(
    (nextUrl?: string) =>
      runSocialSignIn("apple", nextUrl, signInWithAppleSocial),
    [runSocialSignIn]
  );

  const signOutUser = useCallback(async () => {
    if (!auth) {
      setUser(null);
      setProfile(null);
      setProfileError(null);
      setAuthError(null);
      profileSyncRef.current = null;
      return;
    }
    await firebaseSignOut(auth);
    setProfile(null);
    setProfileError(null);
    setAuthError(null);
    profileSyncRef.current = null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    profileSyncRef.current = null;
    await syncProfileForUser(user, true);
  }, [user, syncProfileForUser]);

  const clearPostAuthRedirect = useCallback(() => {
    setPostAuthRedirect(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const isAdmin =
    isDevAdminBypass || (Boolean(user) && isProfileAdmin(profile));

  const value = useMemo(
    () => ({
      user,
      profile,
      profileError,
      authError,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      socialAuthLoadingProvider,
      postAuthRedirect,
      signIn: signInWithEmail,
      signUp: signUpWithEmail,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signOut: signOutUser,
      signOutUser,
      refreshProfile,
      clearPostAuthRedirect,
      clearAuthError,
    }),
    [
      user,
      profile,
      profileError,
      authError,
      loading,
      adminLoading,
      isAdmin,
      isDevAdminBypass,
      socialAuthLoadingProvider,
      postAuthRedirect,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signOutUser,
      refreshProfile,
      clearPostAuthRedirect,
      clearAuthError,
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
