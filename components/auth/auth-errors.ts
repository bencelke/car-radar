import type { Dictionary } from "@/lib/i18n/en";
import { getAuthErrorCode } from "@/lib/auth/social-auth";
import { EXPECTED_FIREBASE_PROJECT_ID } from "@/lib/config/firebase-project";
import {
  app,
  getConfiguredFirebaseProjectId,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import { isFirebaseProjectMismatch } from "@/lib/firebase/project-check";
import type { SocialAuthProviderId } from "@/lib/auth/social-auth";

export type AuthErrorContext = {
  provider?: SocialAuthProviderId | "email";
};

const loggedSocialAuthErrors = new Set<string>();

export function logSocialAuthError(
  provider: SocialAuthProviderId,
  error: unknown
): void {
  if (process.env.NODE_ENV !== "development") return;

  const code = getAuthErrorCode(error);
  const key = `${provider}:${code}:${getConfiguredFirebaseProjectId()}`;
  if (loggedSocialAuthErrors.has(key)) return;
  loggedSocialAuthErrors.add(key);

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  console.warn("[CarRadar] Social auth failed", {
    provider: provider === "apple" ? "apple.com" : "google.com",
    code: code || "(none)",
    message,
    projectId: getConfiguredFirebaseProjectId() || "(missing)",
    expectedProjectId: EXPECTED_FIREBASE_PROJECT_ID,
    projectMismatch: isFirebaseProjectMismatch(app, isFirebaseConfigured),
    hostname:
      typeof window !== "undefined" ? window.location.hostname : "ssr",
  });
}

export function mapFirebaseAuthError(
  error: unknown,
  mode: "signIn" | "signUp" = "signIn",
  t?: Dictionary["auth"],
  context?: AuthErrorContext
): string {
  const code = getAuthErrorCode(error);
  const provider = context?.provider;
  const projectMismatch = isFirebaseProjectMismatch(app, isFirebaseConfigured);

  if (projectMismatch && t?.authFirebaseProjectMismatch) {
    if (
      code === "auth/operation-not-allowed" ||
      code === "auth/invalid-api-key" ||
      code === "permission-denied"
    ) {
      return t.authFirebaseProjectMismatch
        .replace("{configured}", getConfiguredFirebaseProjectId() || "—")
        .replace("{expected}", EXPECTED_FIREBASE_PROJECT_ID);
    }
  }

  if (t) {
    switch (code) {
      case "auth/email-already-in-use":
        return t.authEmailInUse;
      case "auth/account-exists-with-different-credential":
        return t.authAccountExistsDifferentCredential;
      case "auth/invalid-email":
        return t.authInvalidEmail;
      case "auth/weak-password":
        return t.authWeakPassword;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return t.authInvalidCredentials;
      case "auth/too-many-requests":
        return t.authTooManyRequests;
      case "auth/popup-blocked":
        return t.authPopupBlocked;
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return t.authPopupClosed;
      case "auth/unauthorized-domain":
        return t.authUnauthorizedDomain;
      case "auth/operation-not-allowed":
        if (provider === "apple") {
          return t.authAppleOperationNotAllowed;
        }
        if (provider === "google") {
          return t.authGoogleOperationNotAllowed;
        }
        return t.authOperationNotAllowed;
      case "auth/internal-error":
        if (provider === "apple") {
          return t.authAppleConfigIncomplete;
        }
        return t.authInternalError;
      case "auth/network-request-failed":
        return t.authNetworkFailed;
      default:
        return mode === "signIn" ? t.authSignInFailed : t.authSignUpFailed;
    }
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email. Sign in using the original method, then connect another provider from Profile settings.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/popup-blocked":
      return "Popup was blocked. Try redirect sign-in.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication. Add it under Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      if (provider === "apple") {
        return `Apple Sign-In is not enabled for the Firebase project currently used by the app. Verify the app is connected to ${EXPECTED_FIREBASE_PROJECT_ID} and that Apple is enabled there.`;
      }
      return "This sign-in method is not enabled in Firebase Authentication.";
    case "auth/internal-error":
      if (provider === "apple") {
        return "Apple Sign-In requires a configured Apple Service ID, Team ID, Key ID, and private key in Firebase Authentication.";
      }
      return "Authentication failed due to an internal error. Try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return mode === "signIn"
        ? "Could not sign in. Check your email and password."
        : "Could not create account. Try a different email.";
  }
}

export function unauthorizedDomainDetail(hostname: string): string {
  return `Current hostname: ${hostname}`;
}
