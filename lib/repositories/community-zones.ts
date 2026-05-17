import { collection, getDocs, query, where } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { mockCommunityZones } from "@/lib/mock-data/seeds";
import type { CommunityZone } from "@/lib/types";
import { filterApproved, logRepositoryFallback } from "@/lib/repositories/utils";

export async function getApprovedCommunityZones(): Promise<CommunityZone[]> {
  if (!db) return filterApproved(mockCommunityZones);

  try {
    const q = query(
      collection(db, COLLECTIONS.communityZones),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    const zones = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CommunityZone
    );
    return zones.length > 0 ? zones : filterApproved(mockCommunityZones);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.communityZones, error);
    return filterApproved(mockCommunityZones);
  }
}
