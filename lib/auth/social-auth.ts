import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type Auth,
  type User,
  type UserCredential,
} from "firebase/auth";

import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import { auth } from "@/lib/firebase/client";

export const AUTH_NEXT_STORAGE_KEY = "shiftit_auth_next";

export type SocialAuthProviderId = "google" | "apple" | "facebook";
export type SocialAuthMethod = "popup" | "redirect";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function appleProvider(): OAuthProvider {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return provider;
}

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");
facebookProvider.setCustomParameters({ display: "popup" });

const POPUP_AUTH_ERROR_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/popup-blocked",
  "auth/cancelled-popup-request",
]);

let redirectResultProcessed = false;

export function getAuthErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return "";
}

export function isPopupAuthError(error: unknown): boolean {
  return POPUP_AUTH_ERROR_CODES.has(getAuthErrorCode(error));
}

export function isLikelyMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function getPreferredSocialAuthMethod(): SocialAuthMethod {
  return isLikelyMobileBrowser() ? "redirect" : "popup";
}

export function persistAuthNext(nextUrl?: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, sanitizeNextPath(nextUrl));
}

export function consumeAuthNext(): string {
  if (typeof sessionStorage === "undefined") return sanitizeNextPath(null);
  const stored = sessionStorage.getItem(AUTH_NEXT_STORAGE_KEY);
  if (stored) sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY);
  return sanitizeNextPath(stored);
}

export function clearAuthNext(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY);
}

function requireAuth(): Auth {
  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }
  return auth;
}

async function signInWithProvider(
  provider: GoogleAuthProvider | OAuthProvider | FacebookAuthProvider,
  nextUrl?: string,
  forceRedirect = false
): Promise<UserCredential | null> {
  const firebaseAuth = requireAuth();
  const method = forceRedirect ? "redirect" : getPreferredSocialAuthMethod();

  if (method === "redirect") {
    persistAuthNext(nextUrl);
    await signInWithRedirect(firebaseAuth, provider);
    return null;
  }

  try {
    return await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    if (isPopupAuthError(error)) {
      persistAuthNext(nextUrl);
      await signInWithRedirect(firebaseAuth, provider);
      return null;
    }
    throw error;
  }
}

export async function signInWithGoogle(
  nextUrl?: string,
  forceRedirect = false
): Promise<UserCredential | null> {
  return signInWithProvider(googleProvider, nextUrl, forceRedirect);
}

export async function signInWithApple(
  nextUrl?: string,
  forceRedirect = false
): Promise<UserCredential | null> {
  return signInWithProvider(appleProvider(), nextUrl, forceRedirect);
}

export async function signInWithFacebook(
  nextUrl?: string,
  forceRedirect = false
): Promise<UserCredential | null> {
  return signInWithProvider(facebookProvider, nextUrl, forceRedirect);
}

/** Call once on app load to complete a pending redirect sign-in. */
export async function processSocialRedirectResult(): Promise<UserCredential | null> {
  if (!auth || redirectResultProcessed) return null;
  redirectResultProcessed = true;

  try {
    return await getRedirectResult(auth);
  } catch (error) {
    clearAuthNext();
    throw error;
  }
}

export function extractAuthProviders(user: User): string[] {
  const ids = user.providerData
    .map((provider) => provider.providerId)
    .filter((id): id is string => Boolean(id));
  return [...new Set(ids)];
}

export function resolveProviderEmail(user: User): string | null {
  return user.email?.trim() || user.providerData.find((p) => p.email)?.email?.trim() || null;
}
