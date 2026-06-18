"use client";

import { useCallback, useEffect, useState } from "react";

import { getClaimedMemberForUser } from "@/lib/repositories/club-members";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import { getGarageMods } from "@/lib/repositories/garage-mods";
import { getBuildUpdates } from "@/lib/repositories/garage-updates";
import { getGarageByOwnerUid } from "@/lib/repositories/garages";
import type { ClubMember, GarageCar, GarageMod, GarageProfile } from "@/lib/types";

export type ProfileGarageState = {
  loading: boolean;
  garage: GarageProfile | null;
  car: GarageCar | null;
  modCount: number;
  updateCount: number;
  claimedMember: ClubMember | null;
  refresh: () => Promise<void>;
};

export function useProfileGarage(ownerUid: string | undefined): ProfileGarageState {
  const [loading, setLoading] = useState(Boolean(ownerUid));
  const [garage, setGarage] = useState<GarageProfile | null>(null);
  const [car, setCar] = useState<GarageCar | null>(null);
  const [modCount, setModCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [claimedMember, setClaimedMember] = useState<ClubMember | null>(null);

  const refresh = useCallback(async () => {
    if (!ownerUid) {
      setGarage(null);
      setCar(null);
      setModCount(0);
      setUpdateCount(0);
      setClaimedMember(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [g, member] = await Promise.all([
        getGarageByOwnerUid(ownerUid),
        getClaimedMemberForUser(ownerUid),
      ]);
      setClaimedMember(member);
      setGarage(g);

      if (g) {
        const primaryCar = await getPrimaryCarByGarageId(g.id);
        setCar(primaryCar);
        if (primaryCar) {
          const [mods, updates] = await Promise.all([
            getGarageMods(primaryCar.id),
            getBuildUpdates(primaryCar.id),
          ]);
          setModCount(mods.length);
          setUpdateCount(updates.length);
        } else {
          setModCount(0);
          setUpdateCount(0);
        }
      } else {
        setCar(null);
        setModCount(0);
        setUpdateCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [ownerUid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    loading,
    garage,
    car,
    modCount,
    updateCount,
    claimedMember,
    refresh,
  };
}
