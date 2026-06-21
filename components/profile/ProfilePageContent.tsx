"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { AdminAccessCard } from "@/components/profile/AdminAccessCard";
import { ConnectedAccountsCard } from "@/components/profile/ConnectedAccountsCard";
import { GaragePreviewCard } from "@/components/profile/GaragePreviewCard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";
import { ProfilePreferencesCard } from "@/components/profile/ProfilePreferencesCard";
import { ProfileQuickActions } from "@/components/profile/ProfileQuickActions";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { useProfileGarage } from "@/lib/hooks/useProfileGarage";
import { brand } from "@/lib/config/brand";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export function ProfilePageContent() {
  const { t } = useLocale();
  const { user, profile, loading, signOut, reloadProfileFromFirestore, isAdmin } = useAuth();
  const garageState = useProfileGarage(user?.uid);
  const identityRef = useRef<HTMLDivElement>(null);
  const [identityEditing, setIdentityEditing] = useState(false);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6">
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
          {t.profile.title}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">{t.auth.firebaseRequired}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/60 p-6">
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">
          {t.profile.title}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">{t.auth.signIn}</p>
        <Button
          nativeButton={false}
          render={<Link href={brand.nav.login.href} />}
          className="mt-4 min-h-11"
        >
          {t.auth.login}
        </Button>
      </div>
    );
  }

  const publicProfileHref =
    garageState.garage?.status === "published"
      ? `/garage/${garageState.garage.id}`
      : null;

  async function handleRefresh() {
    await Promise.all([
      reloadProfileFromFirestore(),
      garageState.refresh(),
    ]);
  }

  function scrollToIdentityEdit() {
    setIdentityEditing(true);
    identityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <ProfileHero
        user={user}
        profile={profile}
        garage={garageState.garage}
        claimedMember={garageState.claimedMember}
        onPhotoUpdated={handleRefresh}
        onEditProfile={scrollToIdentityEdit}
        publicProfileHref={publicProfileHref}
      />

      <ProfileQuickActions
        garage={garageState.garage}
        car={garageState.car}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-8">
        <div className="space-y-6">
          <GaragePreviewCard
            garage={garageState.garage}
            car={garageState.car}
            modCount={garageState.modCount}
            updateCount={garageState.updateCount}
            loading={garageState.loading}
            profile={profile}
            authDisplayName={user.displayName}
          />

          <div ref={identityRef}>
            <ProfileIdentityCard
              userId={user.uid}
              profile={profile}
              garage={garageState.garage}
              claimedMember={garageState.claimedMember}
              onUpdated={handleRefresh}
              editing={identityEditing}
              onEditingChange={setIdentityEditing}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <ConnectedAccountsCard profile={profile} loading={loading} />
          <ProfilePreferencesCard
            garage={garageState.garage}
            onSignOut={() => void signOut()}
          />
          {isAdmin ? <AdminAccessCard /> : null}
        </aside>
      </div>
    </div>
  );
}
