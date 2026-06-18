import { auth } from "@/lib/firebase/client";

export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  if (!auth?.currentUser) {
    throw new Error("NOT_SIGNED_IN");
  }
  const idToken = await auth.currentUser.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${idToken}`);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}
