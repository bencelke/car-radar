/**
 * CarRadar — Firestore seed script (placeholder)
 *
 * NOT required for local development. The app runs in mock mode without Firebase.
 *
 * When ready to seed a dev/staging project:
 * 1. Copy `.env.example` to `.env.local` and fill Firebase values.
 * 2. Use Firebase Admin SDK or Firebase CLI with a service account (never commit keys).
 * 3. Import seed arrays from `lib/mock-data/seeds.ts`.
 * 4. Write batches to collections defined in `docs/firestore-schema.md`.
 *
 * Example (future implementation):
 *
 * ```ts
 * import { initializeApp, cert } from "firebase-admin/app";
 * import { getFirestore } from "firebase-admin/firestore";
 * import { mockShops, mockEvents, mockCommunities, mockCommunityZones } from "../lib/mock-data/seeds";
 * import { COLLECTIONS } from "../lib/firebase/collections";
 *
 * // initializeApp({ credential: cert(serviceAccount) });
 * // const db = getFirestore();
 * // for (const shop of mockShops) {
 * //   await db.collection(COLLECTIONS.carShops).doc(shop.id).set(shop);
 * // }
 * ```
 *
 * Run with (after adding tsx and admin SDK):
 * `npx tsx scripts/seed-sample-data.ts`
 */

import {
  mockCommunities,
  mockCommunityZones,
  mockEvents,
  mockShops,
} from "../lib/mock-data/seeds";

function main() {
  console.log("[CarRadar] Seed script placeholder — no Firestore writes performed.");
  console.log(`  Shops: ${mockShops.length}`);
  console.log(`  Events: ${mockEvents.length}`);
  console.log(`  Communities: ${mockCommunities.length}`);
  console.log(`  Zones: ${mockCommunityZones.length}`);
  console.log("  Configure Firebase Admin and uncomment implementation when ready.");
}

main();
