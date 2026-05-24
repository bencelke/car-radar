import type { Dictionary } from "@/lib/i18n/en";

export function mapFirebaseAuthError(
  error: unknown,
  mode: "signIn" | "signUp",
  t: Dictionary["auth"]
): string {
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return t.authEmailInUse;
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
    default:
      return mode === "signIn" ? t.authSignInFailed : t.authSignUpFailed;
  }
}
