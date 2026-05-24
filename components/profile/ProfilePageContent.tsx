"use client";

import Link from "next/link";
import { useState } from "react";

import { ProfileImageUploader } from "@/components/images/ProfileImageUploader";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export function ProfilePageContent() {
  const { t } = useLocale();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [uploaded, setUploaded] = useState(false);

  if (loading) {
    return <p className="text-sm text-[#64748B]">…</p>;
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">Profile</h1>
        <p className="text-sm text-[#94A3B8]">{t.auth.firebaseRequired}</p>
        <p className="text-sm text-[#64748B]">{t.profileImages.garageComingLater}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">Profile</h1>
        <p className="text-sm text-[#94A3B8]">{t.auth.signIn}</p>
        <Button
          nativeButton={false}
          render={<Link href={brand.nav.login.href} />}
        >
          {t.auth.login}
        </Button>
      </div>
    );
  }

  const imageUrl = profile?.avatarUrl ?? profile?.imageUrl;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">Profile</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {t.auth.signedInAs} {user.email}
          </p>
        </div>
        <Button
          type="button"
          className="border border-white/10 bg-transparent text-[#CBD5E1] hover:bg-white/5"
          onClick={() => void signOut()}
        >
          {t.auth.signOut}
        </Button>
      </div>

      <p className="text-sm text-[#64748B]">{t.profileImages.garageComingLater}</p>

      <ProfileImageUploader
        ownerType="user"
        ownerId={user.uid}
        currentImageUrl={imageUrl}
        onUploaded={async () => {
          setUploaded(true);
          await refreshProfile();
        }}
      />

      {uploaded ? (
        <p className="text-sm text-emerald-400/90" role="status">
          {t.profileImages.uploadComplete}
        </p>
      ) : null}

    </div>
  );
}
