import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import admin from "firebase-admin";

let initialized = false;

function resolveServiceAccountPath(): string | null {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    path.join(process.cwd(), "secrets", "firebase-service-account.json"),
    path.join(process.cwd(), "serviceAccountKey.json"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function ensureAdminApp(): admin.app.App | null {
  if (initialized && admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountPath = resolveServiceAccountPath();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  if (!serviceAccountPath && !projectId) {
    return null;
  }

  try {
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, "utf8")
      ) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId || serviceAccount.projectId,
      });
    } else if (projectId) {
      admin.initializeApp({ projectId });
    }
    initialized = true;
    return admin.app();
  } catch (error) {
    console.warn("[CarRadar] Firebase Admin SDK init failed:", error);
    return null;
  }
}

export function isAdminSdkConfigured(): boolean {
  return ensureAdminApp() != null;
}

export function getAdminFirestore(): admin.firestore.Firestore | null {
  const app = ensureAdminApp();
  return app ? admin.firestore(app) : null;
}

export function getAdminAuth(): admin.auth.Auth | null {
  const app = ensureAdminApp();
  return app ? admin.auth(app) : null;
}

export async function verifyIdTokenFromHeader(
  request: Request
): Promise<string | null> {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;

  const auth = getAdminAuth();
  if (!auth) return null;

  try {
    const decoded = await auth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}
