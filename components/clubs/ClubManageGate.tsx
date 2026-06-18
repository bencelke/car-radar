"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { canManageClub } from "@/lib/clubs/club-auth";
import { brand } from "@/lib/config/brand";
import type { Club } from "@/lib/types";

type ClubManageLinkProps = {
  club: Club;
  className?: string;
};

export function ClubManageLink({ club, className }: ClubManageLinkProps) {
  const { t } = useLocale();
  const { user, loading, isAdmin } = useAuth();

  if (loading || !user || !canManageClub(club, user.uid, isAdmin)) {
    return null;
  }

  return (
    <Link
      href={`/clubs/${club.slug}/manage`}
      className={className}
    >
      {t.community.manageClub}
    </Link>
  );
}

export function useClubManageRedirect(club: Club, slug: string) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const loginHref = `${brand.nav.login.href}?next=${encodeURIComponent(`/clubs/${slug}/manage`)}`;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loginHref);
    }
  }, [user, loading, router, loginHref]);

  const authorized = Boolean(user && canManageClub(club, user.uid, isAdmin));
  return { loading, authorized, loginHref };
}
