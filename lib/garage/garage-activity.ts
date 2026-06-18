import { doc, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import { getMockGarages, setMockGarage } from "@/lib/mock-data/garage-store";

export async function touchGarageActivity(
  garageId: string,
  at = new Date().toISOString()
): Promise<void> {
  const mock = getMockGarages().find((g) => g.id === garageId);
  if (mock) {
    setMockGarage({ ...mock, lastActivityAt: at, updatedAt: at });
  }
  if (!isFirebaseConfigured || !db) return;

  await setDoc(
    doc(db, COLLECTIONS.garages, garageId),
    sanitizeFirestoreData({ lastActivityAt: at, updatedAt: at }),
    { merge: true }
  );
}
