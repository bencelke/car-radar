"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { GarageEditor } from "@/components/garage/GarageEditor";
import { GarageEmptyState } from "@/components/garage/GarageEmptyState";
import { GarageOnboarding } from "@/components/garage/GarageOnboarding";
import { useAuth } from "@/components/providers/AuthProvider";
import { getClaimedMemberForUser } from "@/lib/repositories/club-members";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import { getGarageMods } from "@/lib/repositories/garage-mods";
import { getBuildUpdates } from "@/lib/repositories/garage-updates";
import { getGarageByOwnerUid } from "@/lib/repositories/garages";
import type { BuildProgressUpdate, GarageCar, GarageMod, GarageProfile } from "@/lib/types";

export function GaragePageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [garage, setGarage] = useState<GarageProfile | null>(null);
  const [car, setCar] = useState<GarageCar | null>(null);
  const [mods, setMods] = useState<GarageMod[]>([]);
  const [updates, setUpdates] = useState<BuildProgressUpdate[]>([]);
  const [claimedMember, setClaimedMember] = useState<Awaited<
    ReturnType<typeof getClaimedMemberForUser>
  > | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [g, member] = await Promise.all([
      getGarageByOwnerUid(user.uid),
      getClaimedMemberForUser(user.uid),
    ]);
    setClaimedMember(member);
    setGarage(g);
    if (g) {
      const c = await getPrimaryCarByGarageId(g.id);
      setCar(c);
      if (c) {
        const [m, u] = await Promise.all([
          getGarageMods(c.id),
          getBuildUpdates(c.id),
        ]);
        setMods(m);
        setUpdates(u);
      } else {
        setMods([]);
        setUpdates([]);
      }
    } else {
      setCar(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (onboarding) {
    return (
      <GarageOnboarding
        ownerUid={user!.uid}
        displayNameDefault={user!.displayName ?? user!.email ?? "Driver"}
        claimedMember={
          claimedMember
            ? {
                id: claimedMember.id,
                clubId: claimedMember.clubId,
                clubName: claimedMember.clubName,
                displayName: claimedMember.displayName,
                instagramHandle: claimedMember.instagramHandle,
                city: claimedMember.city,
                country: claimedMember.country,
                area: claimedMember.area,
              }
            : null
        }
        onComplete={() => {
          setOnboarding(false);
          void load();
        }}
        onCancel={() => setOnboarding(false)}
      />
    );
  }

  if (!garage || !car) {
    return <GarageEmptyState onStart={() => setOnboarding(true)} />;
  }

  return (
    <GarageEditor
      garage={garage}
      car={car}
      initialMods={mods}
      initialUpdates={updates}
      claimedMemberId={claimedMember?.id}
      onRefresh={() => void load()}
    />
  );
}
