import { useAuth } from "@/components/providers/AuthProvider";
import type { UserProfile } from "@/lib/types";

/** Firestore user profile for the signed-in Firebase Auth user. */
export function useCurrentUserProfile(): {
  profile: UserProfile | null;
  loading: boolean;
  adminLoading: boolean;
  refreshProfile: () => Promise<void>;
  reloadProfileFromFirestore: () => Promise<void>;
} {
  const { profile, loading, adminLoading, refreshProfile, reloadProfileFromFirestore } =
    useAuth();
  return {
    profile,
    loading,
    adminLoading,
    refreshProfile,
    reloadProfileFromFirestore,
  };
}
